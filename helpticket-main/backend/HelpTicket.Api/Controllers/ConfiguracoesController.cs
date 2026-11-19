using HelpTicket.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpTicket.Api.Controllers;

[ApiController]
[Route("api/configuracoes")]
[Authorize]
public class ConfiguracoesController : ControllerBase
{
    private readonly SystemSettingsState _settings;
    private readonly EmailService _emailService;
    private readonly IConfiguration _configuration;

    public ConfiguracoesController(
        SystemSettingsState settings,
        EmailService emailService,
        IConfiguration configuration)
    {
        _settings = settings;
        _emailService = emailService;
        _configuration = configuration;
    }

    [HttpGet]
    public IActionResult Obter()
    {
        var hasEnvApiKey = !string.IsNullOrWhiteSpace(_configuration["Brevo:ApiKey"]);
        var senderEmail = !string.IsNullOrWhiteSpace(_settings.SenderEmail)
            ? _settings.SenderEmail
            : (_configuration["Brevo:SenderEmail"] ?? "");

        return Ok(new
        {
            _settings.SlaCriticaHoras,
            _settings.SlaAltaHoras,
            _settings.Expediente,
            _settings.AlertasEmailHabilitados,
            SenderEmail = senderEmail,
            _settings.SenderName,
            BrevoConfigurado = !string.IsNullOrWhiteSpace(_settings.BrevoApiKey) || hasEnvApiKey
        });
    }

    [HttpPut]
    public IActionResult Salvar([FromBody] AtualizarConfiguracoesRequest request)
    {
        _settings.SlaCriticaHoras = request.SlaCriticaHoras > 0 ? request.SlaCriticaHoras : 4;
        _settings.SlaAltaHoras = request.SlaAltaHoras > 0 ? request.SlaAltaHoras : 12;
        _settings.Expediente = string.IsNullOrWhiteSpace(request.Expediente) ? "9-18" : request.Expediente;
        _settings.AlertasEmailHabilitados = request.AlertasEmailHabilitados;

        if (!string.IsNullOrWhiteSpace(request.SenderEmail))
            _settings.SenderEmail = request.SenderEmail.Trim();

        if (!string.IsNullOrWhiteSpace(request.SenderName))
            _settings.SenderName = request.SenderName.Trim();

        if (!string.IsNullOrWhiteSpace(request.BrevoApiKey))
            _settings.BrevoApiKey = request.BrevoApiKey.Trim();

        return Ok(new { mensagem = "Configurações atualizadas com sucesso." });
    }

    [HttpPost("testar-email")]
    public async Task<IActionResult> TestarEmail([FromBody] TestarEmailRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EmailDestino))
            return BadRequest(new { mensagem = "Informe um e-mail de destino para o teste." });

        var enviado = await _emailService.EnviarEmailAsync(
            request.EmailDestino.Trim(),
            "Administrador HelpTicket",
            "🔔 Teste de Integração Brevo — HelpTicket",
            "<p>A integração de alertas por e-mail via <strong>Brevo</strong> está configurada e funcionando perfeitamente no seu HelpTicket!</p>");

        if (!enviado)
            return BadRequest(new { mensagem = _emailService.UltimoErro ?? "Não foi possível enviar o e-mail." });

        return Ok(new { mensagem = $"E-mail de teste enviado com sucesso para {request.EmailDestino}!" });
    }
}

public class AtualizarConfiguracoesRequest
{
    public int SlaCriticaHoras { get; set; } = 4;
    public int SlaAltaHoras { get; set; } = 12;
    public string Expediente { get; set; } = "9-18";
    public bool AlertasEmailHabilitados { get; set; } = true;
    public string? SenderEmail { get; set; }
    public string? SenderName { get; set; }
    public string? BrevoApiKey { get; set; }
}

public class TestarEmailRequest
{
    public string EmailDestino { get; set; } = string.Empty;
}
