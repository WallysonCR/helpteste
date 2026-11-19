using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace HelpTicket.Api.Services;

public class SystemSettingsState
{
    public int SlaCriticaHoras { get; set; } = 4;
    public int SlaAltaHoras { get; set; } = 12;
    public string Expediente { get; set; } = "9-18";
    public bool AlertasEmailHabilitados { get; set; } = true;
    public string? BrevoApiKey { get; set; }
    public string? SenderEmail { get; set; }
    public string SenderName { get; set; } = "HelpTicket Suporte";
}

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly SystemSettingsState _settings;
    private static readonly HttpClient _httpClient = new();

    public EmailService(
        IConfiguration configuration,
        ILogger<EmailService> logger,
        SystemSettingsState settings)
    {
        _configuration = configuration;
        _logger = logger;
        _settings = settings;
    }

    public SystemSettingsState ObterConfiguracoes() => _settings;

    public string? UltimoErro { get; private set; }

    public async Task<bool> EnviarEmailAsync(
        string destinatarioEmail,
        string destinatarioNome,
        string assunto,
        string htmlConteudo)
    {
        UltimoErro = null;
        if (!_settings.AlertasEmailHabilitados)
        {
            UltimoErro = "Alertas por e-mail estão desabilitados nas configurações.";
            _logger.LogInformation("Alertas por e-mail desabilitados. E-mail para {Email} ignorado.", destinatarioEmail);
            return false;
        }

        var apiKey = !string.IsNullOrWhiteSpace(_settings.BrevoApiKey)
            ? _settings.BrevoApiKey
            : (_configuration["Brevo:ApiKey"] ?? _configuration["BREVO_API_KEY"]);

        var senderEmail = !string.IsNullOrWhiteSpace(_settings.SenderEmail)
            ? _settings.SenderEmail
            : (_configuration["Brevo:SenderEmail"] ?? _configuration["BREVO_SENDER_EMAIL"]);

        var senderName = !string.IsNullOrWhiteSpace(_settings.SenderName)
            ? _settings.SenderName
            : (_configuration["Brevo:SenderName"] ?? "HelpTicket Suporte");

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(senderEmail))
        {
            UltimoErro = $"Falta configurar {(string.IsNullOrWhiteSpace(apiKey) ? "a Brevo API Key (xkeysib-...)" : "o E-mail Remetente")}.";
            _logger.LogWarning("Brevo ApiKey ou SenderEmail não configurados. E-mail não enviado para {Email}.", destinatarioEmail);
            return false;
        }

        try
        {
            var payload = new
            {
                sender = new { name = senderName, email = senderEmail },
                to = new[] { new { email = destinatarioEmail, name = destinatarioNome } },
                subject = assunto,
                htmlContent = $@"
                <div style='font-family: Inter, Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>
                  <div style='background: #1B2A4A; color: #ffffff; padding: 18px 24px;'>
                    <h2 style='margin: 0; font-size: 18px;'>HelpTicket Portal</h2>
                  </div>
                  <div style='padding: 24px; color: #0f172a; line-height: 1.6;'>
                    <p style='margin-top: 0;'>Olá, <strong>{destinatarioNome}</strong>,</p>
                    {htmlConteudo}
                    <p style='margin-top: 24px;'>
                      <a href='https://helpticket.vercel.app' style='display: inline-block; background: #0066B2; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600;'>
                        Acessar HelpTicket
                      </a>
                    </p>
                  </div>
                  <div style='background: #f8fafc; padding: 12px 24px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;'>
                    Mensagem automática enviada pelo sistema HelpTicket.
                  </div>
                </div>"
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Add("api-key", apiKey.Trim());
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var erro = await response.Content.ReadAsStringAsync();
                UltimoErro = $"Brevo retornou {(int)response.StatusCode}: {erro}";
                _logger.LogError("Erro ao enviar e-mail via Brevo ({Status}): {Erro}", response.StatusCode, erro);
                return false;
            }

            _logger.LogInformation("E-mail enviado com sucesso via Brevo para {Email}", destinatarioEmail);
            return true;
        }
        catch (Exception ex)
        {
            UltimoErro = $"Erro de conexão com Brevo: {ex.Message}";
            _logger.LogError(ex, "Falha ao chamar API do Brevo para {Email}", destinatarioEmail);
            return false;
        }
    }
}
