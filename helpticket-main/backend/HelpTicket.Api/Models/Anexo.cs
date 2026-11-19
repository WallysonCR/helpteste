namespace HelpTicket.Api.Models;

public class Anexo
{
    public int IdAnexo { get; set; }

    public string NomeArquivo { get; set; } = string.Empty;

    public string TipoArquivo { get; set; } = string.Empty;

    public int TamanhoKb { get; set; }

    public string Caminho { get; set; } = string.Empty;

    public DateTime DataUpload { get; set; }


    public int IdTicket { get; set; }

    public Ticket Ticket { get; set; } = null!;
}