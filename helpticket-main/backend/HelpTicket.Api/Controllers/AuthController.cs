using HelpTicket.Api.DTOs;
using HelpTicket.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HelpTicket.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        [FromBody] LoginRequest request)
    {
        var resultado =
            await _authService.LoginAsync(request);

        if (resultado == null)
        {
            return Unauthorized(new
            {
                mensagem = "E-mail ou senha inválidos."
            });
        }

        return Ok(resultado);
    }

    [HttpPost("esqueci-senha")]
    public async Task<IActionResult> EsqueciSenha([FromBody] EsqueciSenhaRequest request)
    {
        var (sucesso, mensagem) = await _authService.SolicitarRecuperacaoSenhaAsync(request.Email);
        if (!sucesso)
        {
            return BadRequest(new { mensagem });
        }
        return Ok(new { mensagem });
    }

    [HttpPost("redefinir-senha")]
    public async Task<IActionResult> RedefinirSenha([FromBody] RedefinirSenhaRequest request)
    {
        var (sucesso, mensagem) = await _authService.RedefinirSenhaComCodigoAsync(
            request.Email, request.Codigo, request.NovaSenha);
        if (!sucesso)
        {
            return BadRequest(new { mensagem });
        }
        return Ok(new { mensagem });
    }
}