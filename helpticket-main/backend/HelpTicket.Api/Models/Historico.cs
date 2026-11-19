namespace HelpTicket.Api.Models;

public class Historico
{
    public int IdHistorico { get; set; }

    public string Acao { get; set; } = string.Empty;

    public string? ValorAnterior { get; set; }

    public string? ValorNovo { get; set; }

    public DateTime DataAlteracao { get; set; }


    public int IdUsuario { get; set; }

    public Usuario Usuario { get; set; } = null!;


    public int IdTicket { get; set; }

    public Ticket Ticket { get; set; } = null!;
}