using HelpTicket.Api.Enums;

namespace HelpTicket.Api.Models;

public class Ticket
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

    public Usuario Solicitante { get; set; } = null!;


    public int? IdAgente { get; set; }

    public Usuario? Agente { get; set; }


    public int IdCategoria { get; set; }

    public Categoria Categoria { get; set; } = null!;


    public ICollection<Comentario> Comentarios { get; set; }
        = new List<Comentario>();

    public ICollection<Anexo> Anexos { get; set; }
        = new List<Anexo>();

    public ICollection<Historico> Historicos { get; set; }
        = new List<Historico>();

    public ICollection<Notificacao> Notificacoes { get; set; }
        = new List<Notificacao>();
}