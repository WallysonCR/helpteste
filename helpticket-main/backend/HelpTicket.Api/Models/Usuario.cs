using HelpTicket.Api.Enums;

namespace HelpTicket.Api.Models;

public class Usuario
{
    public int IdUsuario { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string SenhaHash { get; set; } = string.Empty;

    public TipoUsuario TipoUsuario { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime DataCriacao { get; set; }

    public ICollection<Ticket> TicketsSolicitados { get; set; }
        = new List<Ticket>();

    public ICollection<Ticket> TicketsAtendidos { get; set; }
        = new List<Ticket>();

    public ICollection<Comentario> Comentarios { get; set; }
        = new List<Comentario>();

    public ICollection<Historico> Historicos { get; set; }
        = new List<Historico>();

    public ICollection<Notificacao> Notificacoes { get; set; }
        = new List<Notificacao>();
}