using HelpTicket.Api.Enums;

namespace HelpTicket.Api.Models;

public class Notificacao
{
    public int IdNotificacao { get; set; }

    public string Mensagem { get; set; } = string.Empty;

    public DateTime DataEnvio { get; set; }

    public bool Lida { get; set; }

    public TipoNotificacao Tipo { get; set; }


    public int IdTicket { get; set; }

    public Ticket Ticket { get; set; } = null!;


    public int IdUsuario { get; set; }

    public Usuario Usuario { get; set; } = null!;
}