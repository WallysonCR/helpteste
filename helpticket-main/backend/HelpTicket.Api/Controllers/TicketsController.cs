using System.Security.Claims;
using HelpTicket.Api.DTOs;
using HelpTicket.Api.Enums;
using HelpTicket.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpTicket.Api.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;

    public TicketsController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<TicketListResponse>>> Listar(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        [FromQuery] bool meus = false)
    {
        StatusTicket? statusEnum = null;
        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<StatusTicket>(status, true, out var parsed))
            statusEnum = parsed;

        var role = User.FindFirstValue(ClaimTypes.Role);
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(usuarioIdClaim, out var idUsuario);

        int? idSolicitante = null;
        int? idAgente = null;

        if (role == nameof(TipoUsuario.Solicitante))
        {
            idSolicitante = idUsuario;
        }
        else if (meus && role == nameof(TipoUsuario.Agente))
        {
            idAgente = idUsuario;
        }

        var resultado = await _ticketService.ListarAsync(
            page, pageSize, statusEnum, search, idSolicitante, idAgente);
        return Ok(resultado);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketDetalheResponse>> ObterPorId(int id)
    {
        var ticket = await _ticketService.ObterPorIdAsync(id);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpPost]
    public async Task<ActionResult<TicketResponse>> Criar(
        [FromBody] CriarTicketRequest request)
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(usuarioIdClaim, out var idUsuario))
            return Unauthorized(new { mensagem = "Usuário não identificado." });

        var ticket = await _ticketService.CriarAsync(request, idUsuario);
        if (ticket == null)
            return BadRequest(new { mensagem = "Categoria inválida ou inativa." });

        return StatusCode(StatusCodes.Status201Created, ticket);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> AtualizarStatus(
        int id, [FromBody] AtualizarStatusRequest request)
    {
        await _ticketService.AtualizarStatusAsync(id, request.Status);
        return NoContent();
    }

    [HttpPatch("{id:int}/agente")]
    public async Task<IActionResult> AtribuirAgente(
        int id, [FromBody] AtribuirAgenteRequest request)
    {
        await _ticketService.AtribuirAgenteAsync(id, request.IdAgente);
        return NoContent();
    }

    [HttpPost("{id:int}/anexos")]
    public async Task<IActionResult> SalvarAnexos(
        int id, [FromBody] SalvarAnexosRequest request)
    {
        await _ticketService.SalvarAnexosAsync(id, request.Anexos);
        return NoContent();
    }

    [HttpPost("{id:int}/comentarios")]
    public async Task<ActionResult<ComentarioResponse>> AdicionarComentario(
        int id, [FromBody] CriarComentarioRequest request)
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(usuarioIdClaim, out var idUsuario))
            return Unauthorized(new { mensagem = "Usuário não identificado." });

        if (string.IsNullOrWhiteSpace(request.Mensagem))
            return BadRequest(new { mensagem = "A mensagem não pode estar vazia." });

        var comentario = await _ticketService.AdicionarComentarioAsync(id, idUsuario, request);
        if (comentario == null)
            return NotFound(new { mensagem = "Chamado não encontrado." });

        return StatusCode(StatusCodes.Status201Created, comentario);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<StatsResponse>> Stats()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(usuarioIdClaim, out var idUsuario);

        int? idSolicitante = role == nameof(TipoUsuario.Solicitante) ? idUsuario : null;

        var stats = await _ticketService.ObterStatsAsync(idSolicitante);
        return Ok(stats);
    }
}