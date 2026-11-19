namespace HelpTicket.Api.Models;

public class Comentario
{
    public int IdComentario { get; set; }

    public string Mensagem { get; set; } = string.Empty;

    public DateTime DataEnvio { get; set; }

    public bool Interno { get; set; }


    public int IdTicket { get; set; }

    public Ticket Ticket { get; set; } = null!;


    public int IdUsuario { get; set; }

    public Usuario Usuario { get; set; } = null!;
}