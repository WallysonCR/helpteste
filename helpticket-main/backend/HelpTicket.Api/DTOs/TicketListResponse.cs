namespace HelpTicket.Api.DTOs;

public class TicketListResponse
{
    public int IdTicket { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Prioridade { get; set; } = string.Empty;
    public DateTime DataAbertura { get; set; }
    public int IdSolicitante { get; set; }
    public string NomeSolicitante { get; set; } = string.Empty;
    public int? IdAgente { get; set; }
    public string? NomeAgente { get; set; }
    public string NomeCategoria { get; set; } = string.Empty;
}
