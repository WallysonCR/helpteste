using HelpTicket.Api.DTOs;
using HelpTicket.Api.Enums;
using HelpTicket.Api.Models;
using HelpTicket.Api.Repositories;

namespace HelpTicket.Api.Services;

public class TicketService
{
    private readonly TicketRepository _ticketRepository;
    private readonly CategoriaRepository _categoriaRepository;
    private readonly EmailService? _emailService;

    public TicketService(
        TicketRepository ticketRepository,
        CategoriaRepository categoriaRepository,
        EmailService? emailService = null)
    {
        _ticketRepository = ticketRepository;
        _categoriaRepository = categoriaRepository;
        _emailService = emailService;
    }

    public async Task<PagedResponse<TicketListResponse>> ListarAsync(
        int page, int pageSize, StatusTicket? status, string? search,
        int? idSolicitante = null, int? idAgente = null)
    {
        var (items, total) = await _ticketRepository.ListarAsync(
            page, pageSize, status, search, idSolicitante, idAgente);

        return new PagedResponse<TicketListResponse>
        {
            Items = items.Select(t => new TicketListResponse
            {
                IdTicket = t.IdTicket,
                Titulo = t.Titulo,
                Status = t.Status.ToString(),
                Prioridade = t.Prioridade.ToString(),
                DataAbertura = t.DataAbertura,
                IdSolicitante = t.IdSolicitante,
                NomeSolicitante = t.Solicitante.Nome,
                IdAgente = t.IdAgente,
                NomeAgente = t.Agente?.Nome,
                NomeCategoria = t.Categoria.Nome
            }).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<TicketDetalheResponse?> ObterPorIdAsync(int id)
    {
        var t = await _ticketRepository.ObterPorIdAsync(id);
        if (t == null) return null;

        return new TicketDetalheResponse
        {
            IdTicket = t.IdTicket,
            Titulo = t.Titulo,
            Descricao = t.Descricao,
            Status = t.Status.ToString(),
            Prioridade = t.Prioridade.ToString(),
            DataAbertura = t.DataAbertura,
            DataResolucao = t.DataResolucao,
            DataFechamento = t.DataFechamento,
            NomeSolicitante = t.Solicitante.Nome,
            EmailSolicitante = t.Solicitante.Email,
            IdAgente = t.IdAgente,
            NomeAgente = t.Agente?.Nome,
            NomeCategoria = t.Categoria.Nome,
            Comentarios = t.Comentarios.Select(c => new ComentarioResponse
            {
                IdComentario = c.IdComentario,
                Mensagem = c.Mensagem,
                DataCriacao = c.DataEnvio,
                NomeAutor = c.Usuario.Nome
            }).ToList(),
            Anexos = t.Anexos.Select(a => new AnexoResponse
            {
                IdAnexo = a.IdAnexo,
                NomeArquivo = a.NomeArquivo,
                TipoArquivo = a.TipoArquivo,
                TamanhoKb = a.TamanhoKb,
                Caminho = a.Caminho,
                DataUpload = a.DataUpload
            }).ToList()
        };
    }

    public async Task<TicketResponse?> CriarAsync(
        CriarTicketRequest request, int idSolicitante)
    {
        var categoria = await _categoriaRepository.ObterPorIdAsync(request.IdCategoria);
        if (categoria == null) return null;

        var ticket = new Ticket
        {
            Titulo = request.Titulo,
            Descricao = request.Descricao,
            Prioridade = request.Prioridade,
            Status = StatusTicket.Aberto,
            DataAbertura = DateTime.UtcNow,
            IdSolicitante = idSolicitante,
            IdCategoria = request.IdCategoria,
            IdAgente = null,
            DataResolucao = null,
            DataFechamento = null
        };

        await _ticketRepository.CriarAsync(ticket);

        if (_emailService != null)
        {
            var completo = await _ticketRepository.ObterPorIdAsync(ticket.IdTicket);
            if (completo?.Solicitante?.Email != null)
            {
                await _emailService.EnviarEmailAsync(
                    completo.Solicitante.Email,
                    completo.Solicitante.Nome,
                    $"✅ Chamado #{completo.IdTicket} aberto com sucesso — {completo.Titulo}",
                    $"<p>Recebemos a sua solicitação <strong>#{completo.IdTicket} — {completo.Titulo}</strong> (Prioridade: <strong>{completo.Prioridade}</strong>).</p><p>Nossa equipe técnica já foi acionada e você receberá atualizações por aqui.</p>");
            }
        }

        return new TicketResponse
        {
            IdTicket = ticket.IdTicket,
            Titulo = ticket.Titulo,
            Descricao = ticket.Descricao,
            Status = ticket.Status,
            Prioridade = ticket.Prioridade,
            DataAbertura = ticket.DataAbertura,
            DataResolucao = ticket.DataResolucao,
            DataFechamento = ticket.DataFechamento,
            IdSolicitante = ticket.IdSolicitante,
            IdAgente = ticket.IdAgente,
            IdCategoria = ticket.IdCategoria
        };
    }

    public async Task AtualizarStatusAsync(int id, StatusTicket status)
    {
        await _ticketRepository.AtualizarStatusAsync(id, status);

        if (_emailService != null)
        {
            var ticket = await _ticketRepository.ObterPorIdAsync(id);
            if (ticket?.Solicitante?.Email != null)
            {
                await _emailService.EnviarEmailAsync(
                    ticket.Solicitante.Email,
                    ticket.Solicitante.Nome,
                    $"🔔 Status do chamado #{ticket.IdTicket} atualizado para {status}",
                    $"<p>O status do seu chamado <strong>#{ticket.IdTicket} — {ticket.Titulo}</strong> foi atualizado para <strong>{status}</strong>.</p>");
            }
        }
    }

    public async Task AtribuirAgenteAsync(int id, int idAgente)
    {
        await _ticketRepository.AtribuirAgenteAsync(id, idAgente);

        if (_emailService != null)
        {
            var ticket = await _ticketRepository.ObterPorIdAsync(id);
            if (ticket?.Agente?.Email != null)
            {
                await _emailService.EnviarEmailAsync(
                    ticket.Agente.Email,
                    ticket.Agente.Nome,
                    $"🎧 Chamado #{ticket.IdTicket} atribuído para você",
                    $"<p>O chamado <strong>#{ticket.IdTicket} — {ticket.Titulo}</strong> (Prioridade: <strong>{ticket.Prioridade}</strong>) foi atribuído para o seu atendimento.</p>");
            }
        }
    }

    public async Task SalvarAnexosAsync(int idTicket, List<AnexoItem> anexos)
    {
        await _ticketRepository.SalvarAnexosAsync(idTicket, anexos);
    }

    public async Task<ComentarioResponse?> AdicionarComentarioAsync(
        int idTicket, int idUsuario, CriarComentarioRequest request)
    {
        var c = await _ticketRepository.AdicionarComentarioAsync(
            idTicket, idUsuario, request.Mensagem, request.Interno);
        if (c == null) return null;

        if (_emailService != null)
        {
            var ticket = await _ticketRepository.ObterPorIdAsync(idTicket);
            if (ticket != null)
            {
                var destinatario = idUsuario == ticket.IdSolicitante ? ticket.Agente : ticket.Solicitante;
                if (destinatario?.Email != null)
                {
                    await _emailService.EnviarEmailAsync(
                        destinatario.Email,
                        destinatario.Nome,
                        $"💬 Nova resposta no chamado #{ticket.IdTicket}",
                        $"<p><strong>{c.Usuario.Nome}</strong> enviou uma nova resposta no chamado <strong>#{ticket.IdTicket} — {ticket.Titulo}</strong>:</p><blockquote style='border-left: 3px solid #0066B2; padding-left: 12px; color: #334155;'>{request.Mensagem}</blockquote>");
                }
            }
        }

        return new ComentarioResponse
        {
            IdComentario = c.IdComentario,
            Mensagem = c.Mensagem,
            DataCriacao = c.DataEnvio,
            NomeAutor = c.Usuario.Nome
        };
    }

    public async Task<StatsResponse> ObterStatsAsync(int? idSolicitante = null)
    {
        var data = await _ticketRepository.ObterStatsAsync(idSolicitante);
        var tickets = data.Tickets;

        var porCategoria = tickets
            .GroupBy(t => t.Categoria?.Nome ?? "Sem categoria")
            .Select(g => new CategoriaStatResponse { Nome = g.Key, Quantidade = g.Count() })
            .OrderByDescending(c => c.Quantidade)
            .ToList();

        var hoje = DateTime.UtcNow.Date;
        var diasSemana = new[] { "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" };
        var porDia = Enumerable.Range(0, 7)
            .Select(i => hoje.AddDays(-6 + i))
            .Select(d => new DiaStat
            {
                Label = diasSemana[(int)d.DayOfWeek],
                Quantidade = tickets.Count(t => t.DataAbertura.Date == d)
            })
            .ToList();

        return new StatsResponse
        {
            Total = tickets.Count,
            Abertos = tickets.Count(t => t.Status == StatusTicket.Aberto),
            EmAtendimento = tickets.Count(t => t.Status == StatusTicket.EmAtendimento),
            Resolvidos = tickets.Count(t => t.Status == StatusTicket.Resolvido),
            Fechados = tickets.Count(t => t.Status == StatusTicket.Fechado),
            Criticos = tickets.Count(t => t.Prioridade == PrioridadeTicket.Critica && t.Status != StatusTicket.Fechado),
            PorCategoria = porCategoria,
            PorDia = porDia
        };
    }
}