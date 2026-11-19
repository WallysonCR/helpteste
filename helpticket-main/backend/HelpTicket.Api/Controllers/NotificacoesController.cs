using System.Security.Claims;
using HelpTicket.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpTicket.Api.Controllers;

[ApiController]
[Route("api/notificacoes")]
[Authorize]
public class NotificacoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificacoesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(usuarioIdClaim, out var idUsuario))
            return Unauthorized();

        var notificacoes = await _context.Notificacoes
            .Include(n => n.Ticket)
            .Where(n => n.IdUsuario == idUsuario)
            .OrderByDescending(n => n.DataEnvio)
            .Take(30)
            .Select(n => new
            {
                n.IdNotificacao,
                n.IdTicket,
                TituloTicket = n.Ticket.Titulo,
                n.Mensagem,
                Tipo = n.Tipo.ToString(),
                n.DataEnvio,
                n.Lida
            })
            .ToListAsync();

        return Ok(notificacoes);
    }

    [HttpPatch("ler-todas")]
    public async Task<IActionResult> MarcarTodasComoLidas()
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(usuarioIdClaim, out var idUsuario))
            return Unauthorized();

        var pendentes = await _context.Notificacoes
            .Where(n => n.IdUsuario == idUsuario && !n.Lida)
            .ToListAsync();

        foreach (var n in pendentes)
        {
            n.Lida = true;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}

