using HelpTicket.Api.Data;
using HelpTicket.Api.Enums;
using HelpTicket.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpTicket.Api.Repositories;

public class TicketRepository
{
    private readonly AppDbContext _context;

    public TicketRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Ticket> CriarAsync(Ticket ticket)
    {
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();
        return ticket;
    }

    public async Task<(List<Ticket> Items, int Total)> ListarAsync(
        int page, int pageSize, StatusTicket? status, string? search,
        int? idSolicitante = null, int? idAgente = null)
    {
        var query = _context.Tickets
            .Include(t => t.Solicitante)
            .Include(t => t.Agente)
            .Include(t => t.Categoria)
            .AsQueryable();

        if (idSolicitante.HasValue)
            query = query.Where(t => t.IdSolicitante == idSolicitante.Value);

        if (idAgente.HasValue)
            query = query.Where(t => t.IdAgente == idAgente.Value);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Titulo.ToLower().Contains(search.ToLower()));

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.DataAbertura)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Ticket?> ObterPorIdAsync(int id)
    {
        return await _context.Tickets
            .Include(t => t.Solicitante)
            .Include(t => t.Agente)
            .Include(t => t.Categoria)
            .Include(t => t.Comentarios)
                .ThenInclude(c => c.Usuario)
            .Include(t => t.Anexos)
            .FirstOrDefaultAsync(t => t.IdTicket == id);
    }

    public async Task AtualizarStatusAsync(int id, StatusTicket status)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return;
        ticket.Status = status;
        if (status == StatusTicket.Resolvido) ticket.DataResolucao = DateTime.UtcNow;
        if (status == StatusTicket.Fechado) ticket.DataFechamento = DateTime.UtcNow;

        _context.Notificacoes.Add(new Notificacao
        {
            IdTicket = ticket.IdTicket,
            IdUsuario = ticket.IdSolicitante,
            Tipo = TipoNotificacao.StatusAlterado,
            Mensagem = $"O status do chamado #{ticket.IdTicket} ({ticket.Titulo}) foi alterado para {status}.",
            DataEnvio = DateTime.UtcNow,
            Lida = false
        });

        await _context.SaveChangesAsync();
    }

    public async Task AtribuirAgenteAsync(int id, int idAgente)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return;
        ticket.IdAgente = idAgente;
        if (ticket.Status == StatusTicket.Aberto)
            ticket.Status = StatusTicket.EmAtendimento;

        _context.Notificacoes.Add(new Notificacao
        {
            IdTicket = ticket.IdTicket,
            IdUsuario = idAgente,
            Tipo = TipoNotificacao.TicketAtribuido,
            Mensagem = $"O chamado #{ticket.IdTicket} ({ticket.Titulo}) foi atribuído para você.",
            DataEnvio = DateTime.UtcNow,
            Lida = false
        });

        await _context.SaveChangesAsync();
    }

    public async Task<Comentario?> AdicionarComentarioAsync(int idTicket, int idUsuario, string mensagem, bool interno)
    {
        var ticket = await _context.Tickets.FindAsync(idTicket);
        var usuario = await _context.Usuarios.FindAsync(idUsuario);
        if (ticket == null || usuario == null) return null;

        var comentario = new Comentario
        {
            IdTicket = idTicket,
            IdUsuario = idUsuario,
            Mensagem = mensagem,
            Interno = interno,
            DataEnvio = DateTime.UtcNow,
            Usuario = usuario
        };

        _context.Comentarios.Add(comentario);

        var idDestinatario = idUsuario == ticket.IdSolicitante
            ? (ticket.IdAgente ?? ticket.IdSolicitante)
            : ticket.IdSolicitante;

        _context.Notificacoes.Add(new Notificacao
        {
            IdTicket = ticket.IdTicket,
            IdUsuario = idDestinatario,
            Tipo = TipoNotificacao.ComentarioAdicionado,
            Mensagem = $"{usuario.Nome} comentou no chamado #{ticket.IdTicket}: \"{mensagem}\"",
            DataEnvio = DateTime.UtcNow,
            Lida = false
        });

        await _context.SaveChangesAsync();
        return comentario;
    }

    public async Task SalvarAnexosAsync(int idTicket, List<HelpTicket.Api.DTOs.AnexoItem> anexos)
    {
        var entities = anexos.Select(a => new HelpTicket.Api.Models.Anexo
        {
            IdTicket = idTicket,
            NomeArquivo = a.NomeArquivo,
            TipoArquivo = a.TipoArquivo,
            TamanhoKb = a.TamanhoKb,
            Caminho = a.Caminho,
            DataUpload = DateTime.UtcNow
        });
        _context.Anexos.AddRange(entities);
        await _context.SaveChangesAsync();
    }

    public async Task<StatsData> ObterStatsAsync(int? idSolicitante = null)
    {
        var query = _context.Tickets
            .Include(t => t.Categoria)
            .AsQueryable();

        if (idSolicitante.HasValue)
            query = query.Where(t => t.IdSolicitante == idSolicitante.Value);

        var tickets = await query.ToListAsync();

        var hoje = DateTime.UtcNow.Date;
        var porDia = Enumerable.Range(0, 7)
            .Select(i => hoje.AddDays(-6 + i))
            .Select(d => new { Data = d, Qtd = tickets.Count(t => t.DataAbertura.Date == d) })
            .ToList();

        return new StatsData
        {
            Tickets = tickets,
            PorDia = porDia.Select(d => new { d.Data, d.Qtd }).ToList<dynamic>()
        };
    }
}

public class StatsData
{
    public List<HelpTicket.Api.Models.Ticket> Tickets { get; set; } = [];
    public List<dynamic> PorDia { get; set; } = [];
}