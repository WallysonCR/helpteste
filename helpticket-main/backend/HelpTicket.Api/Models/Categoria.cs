namespace HelpTicket.Api.Models;

public class Categoria
{
    public int IdCategoria { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string? Descricao { get; set; }

    public bool Ativa { get; set; } = true;

    public ICollection<Ticket> Tickets { get; set; }
        = new List<Ticket>();
}