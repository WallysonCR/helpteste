using HelpTicket.Api.Enums;

namespace HelpTicket.Api.DTOs;

public class TicketResponse
{
    public int IdTicket { get; set; }

    public string Titulo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public StatusTicket Status { get; set; }

    public PrioridadeTicket Prioridade { get; set; }

    public DateTime DataAbertura { get; set; }

    public DateTime? DataResolucao { get; set; }

    public DateTime? DataFechamento { get; set; }

    public int IdSolicitante { get; set; }

    public int? IdAgente { get; set; }

    public int IdCategoria { get; set; }
}