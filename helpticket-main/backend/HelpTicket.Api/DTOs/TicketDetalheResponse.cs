namespace HelpTicket.Api.DTOs;

public class TicketDetalheResponse
{
    public int IdTicket { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Prioridade { get; set; } = string.Empty;
    public DateTime DataAbertura { get; set; }
    public DateTime? DataResolucao { get; set; }
    public DateTime? DataFechamento { get; set; }
    public string NomeSolicitante { get; set; } = string.Empty;
    public string EmailSolicitante { get; set; } = string.Empty;
    public int? IdAgente { get; set; }
    public string? NomeAgente { get; set; }
    public string NomeCategoria { get; set; } = string.Empty;
    public List<ComentarioResponse> Comentarios { get; set; } = [];
    public List<AnexoResponse> Anexos { get; set; } = [];
}

public class ComentarioResponse
{
    public int IdComentario { get; set; }
    public string Mensagem { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }
    public string NomeAutor { get; set; } = string.Empty;
}

public class CriarComentarioRequest
{
    public string Mensagem { get; set; } = string.Empty;
    public bool Interno { get; set; } = false;
}
