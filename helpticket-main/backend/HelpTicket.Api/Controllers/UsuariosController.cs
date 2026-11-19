using System.Security.Claims;
using HelpTicket.Api.Data;
using HelpTicket.Api.Enums;
using HelpTicket.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpTicket.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<Usuario> _passwordHasher;

    public UsuariosController(AppDbContext context, IPasswordHasher<Usuario> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var usuarios = await _context.Usuarios
            .OrderBy(u => u.Nome)
            .Select(u => new
            {
                u.IdUsuario,
                u.Nome,
                u.Email,
                Tipo = u.TipoUsuario.ToString(),
                Status = u.Ativo ? "ativo" : "inativo"
            })
            .ToListAsync();

        return Ok(usuarios);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarUsuarioRequest request)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            return Conflict(new { mensagem = "E-mail já cadastrado." });

        var usuario = new Usuario
        {
            Nome = request.Nome,
            Email = request.Email,
            TipoUsuario = request.Tipo,
            Ativo = request.Status == "ativo",
            DataCriacao = DateTime.UtcNow
        };

        usuario.SenhaHash = _passwordHasher.HashPassword(usuario, request.Senha ?? "Mudar@123");

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created, new
        {
            usuario.IdUsuario,
            usuario.Nome,
            usuario.Email,
            Tipo = usuario.TipoUsuario.ToString(),
            Status = usuario.Ativo ? "ativo" : "inativo"
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarUsuarioRequest request)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();

        usuario.Nome = request.Nome;
        usuario.Email = request.Email;
        usuario.TipoUsuario = request.Tipo;
        usuario.Ativo = request.Status == "ativo";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("me")]
    public async Task<IActionResult> ObterMeuPerfil()
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(usuarioIdClaim, out var idUsuario))
            return Unauthorized();

        var usuario = await _context.Usuarios.FindAsync(idUsuario);
        if (usuario == null) return NotFound();

        return Ok(new
        {
            usuario.IdUsuario,
            usuario.Nome,
            usuario.Email,
            Tipo = usuario.TipoUsuario.ToString(),
            Status = usuario.Ativo ? "ativo" : "inativo",
            usuario.DataCriacao
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> AtualizarMeuPerfil([FromBody] AtualizarMeuPerfilRequest request)
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(usuarioIdClaim, out var idUsuario))
            return Unauthorized();

        var usuario = await _context.Usuarios.FindAsync(idUsuario);
        if (usuario == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.Nome))
            usuario.Nome = request.Nome;

        if (!string.IsNullOrWhiteSpace(request.Email))
            usuario.Email = request.Email;

        if (!string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            if (string.IsNullOrWhiteSpace(request.SenhaAtual))
                return BadRequest(new { mensagem = "Informe a senha atual para alterar a senha." });

            var verificacao = _passwordHasher.VerifyHashedPassword(
                usuario, usuario.SenhaHash, request.SenhaAtual);

            if (verificacao == PasswordVerificationResult.Failed)
                return BadRequest(new { mensagem = "A senha atual está incorreta." });

            usuario.SenhaHash = _passwordHasher.HashPassword(usuario, request.NovaSenha);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            usuario.IdUsuario,
            usuario.Nome,
            usuario.Email,
            TipoUsuario = usuario.TipoUsuario.ToString()
        });
    }
}

public class AtualizarMeuPerfilRequest
{
    public string? Nome { get; set; }
    public string? Email { get; set; }
    public string? SenhaAtual { get; set; }
    public string? NovaSenha { get; set; }
}

public class CriarUsuarioRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public TipoUsuario Tipo { get; set; }
    public string Status { get; set; } = "ativo";
    public string? Senha { get; set; }
}

public class AtualizarUsuarioRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public TipoUsuario Tipo { get; set; }
    public string Status { get; set; } = "ativo";
}
