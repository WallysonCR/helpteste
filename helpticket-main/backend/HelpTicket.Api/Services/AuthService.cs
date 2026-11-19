using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HelpTicket.Api.DTOs;
using HelpTicket.Api.Models;
using HelpTicket.Api.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace HelpTicket.Api.Services;

public class AuthService
{
    private readonly UsuarioRepository _usuarioRepository;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<Usuario> _passwordHasher;
    private readonly EmailService? _emailService;

    private static readonly ConcurrentDictionary<string, (string Codigo, DateTime ExpiraEm)> _codigosRecuperacao = new();

    public AuthService(
        UsuarioRepository usuarioRepository,
        IConfiguration configuration,
        IPasswordHasher<Usuario> passwordHasher,
        EmailService? emailService = null)
    {
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
    }


    public async Task<LoginResponse?> LoginAsync(
        LoginRequest request)
    {
        var usuario =
            await _usuarioRepository.ObterPorEmailAsync(
                request.Email
            );

        if (usuario == null || !usuario.Ativo)
        {
            return null;
        }

        var resultadoSenha =
            _passwordHasher.VerifyHashedPassword(
                usuario,
                usuario.SenhaHash,
                request.Senha
            );

        if (resultadoSenha == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var expiracao = DateTime.UtcNow.AddDays(7);

        var token = GerarToken(
            usuario,
            expiracao
        );

        return new LoginResponse
        {
            Token = token,
            ExpiraEm = expiracao,
            IdUsuario = usuario.IdUsuario,
            Nome = usuario.Nome,
            Email = usuario.Email,
            TipoUsuario = usuario.TipoUsuario
        };
    }

    public async Task<(bool Sucesso, string Mensagem)> SolicitarRecuperacaoSenhaAsync(string email)
    {
        var usuario = await _usuarioRepository.ObterPorEmailAsync(email.Trim());
        if (usuario == null || !usuario.Ativo)
        {
            return (false, "Nenhuma conta ativa encontrada com este e-mail.");
        }

        var codigo = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        _codigosRecuperacao[usuario.Email.ToLowerInvariant()] = (codigo, DateTime.UtcNow.AddMinutes(15));

        if (_emailService == null)
        {
            return (false, "Serviço de e-mail não disponível.");
        }

        var enviado = await _emailService.EnviarEmailAsync(
            usuario.Email,
            usuario.Nome,
            "🔐 Código de Recuperação de Senha — HelpTicket",
            $@"<p>Você solicitou a redefinição da sua senha no <strong>HelpTicket</strong>.</p>
               <p>Utilize o código de 6 dígitos abaixo na tela de login para criar sua nova senha (válido por 15 minutos):</p>
               <div style='margin: 20px 0; padding: 16px; background: #f1f5f9; border: 1px dashed #0066B2; border-radius: 10px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0066B2;'>
                 {codigo}
               </div>
               <p style='font-size: 13px; color: #64748b;'>Se você não solicitou esta alteração, ignore este e-mail.</p>");

        if (!enviado)
        {
            return (false, _emailService.UltimoErro ?? "Não foi possível enviar o e-mail de recuperação.");
        }

        return (true, $"Enviamos um código de 6 dígitos para {usuario.Email}.");
    }

    public async Task<(bool Sucesso, string Mensagem)> RedefinirSenhaComCodigoAsync(
        string email, string codigo, string novaSenha)
    {
        var chave = email.Trim().ToLowerInvariant();
        if (!_codigosRecuperacao.TryGetValue(chave, out var registro))
        {
            return (false, "Código inválido ou expirado. Solicite um novo código.");
        }

        if (DateTime.UtcNow > registro.ExpiraEm)
        {
            _codigosRecuperacao.TryRemove(chave, out _);
            return (false, "O código expirou. Solicite um novo código.");
        }

        if (!string.Equals(registro.Codigo, codigo.Trim(), StringComparison.Ordinal))
        {
            return (false, "O código informado está incorreto.");
        }

        var usuario = await _usuarioRepository.ObterPorEmailAsync(email.Trim());
        if (usuario == null || !usuario.Ativo)
        {
            return (false, "Usuário não encontrado.");
        }

        usuario.SenhaHash = _passwordHasher.HashPassword(usuario, novaSenha);
        await _usuarioRepository.AtualizarAsync(usuario);

        _codigosRecuperacao.TryRemove(chave, out _);
        return (true, "Senha redefinida com sucesso! Você já pode entrar com a nova senha.");
    }


    private string GerarToken(
        Usuario usuario,
        DateTime expiracao)
    {
        var jwtKey =
            _configuration["Jwt:Key"]
            ?? throw new Exception(
                "Jwt:Key não configurada."
            );

        var issuer =
            _configuration["Jwt:Issuer"];

        var audience =
            _configuration["Jwt:Audience"];


        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                usuario.IdUsuario.ToString()
            ),

            new(
                ClaimTypes.Name,
                usuario.Nome
            ),

            new(
                ClaimTypes.Email,
                usuario.Email
            ),

            new(
                ClaimTypes.Role,
                usuario.TipoUsuario.ToString()
            ),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString()
            )
        };


        var chave = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        );


        var credenciais = new SigningCredentials(
            chave,
            SecurityAlgorithms.HmacSha256
        );


        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiracao,
            signingCredentials: credenciais
        );


        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}