using System.ComponentModel.DataAnnotations;

namespace HelpTicket.Api.DTOs;

public class SalvarAnexosRequest
{
    [Required]
    public List<AnexoItem> Anexos { get; set; } = [];
}

public class AnexoItem
{
    public string NomeArquivo { get; set; } = string.Empty;
    public string TipoArquivo { get; set; } = string.Empty;
    public int TamanhoKb { get; set; }
    public string Caminho { get; set; } = string.Empty;
}

public class AnexoResponse
{
    public int IdAnexo { get; set; }
    public string NomeArquivo { get; set; } = string.Empty;
    public string TipoArquivo { get; set; } = string.Empty;
    public int TamanhoKb { get; set; }
    public string Caminho { get; set; } = string.Empty;
    public DateTime DataUpload { get; set; }
}
