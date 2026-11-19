namespace HelpTicket.Api.DTOs;

public class StatsResponse
{
    public int Total { get; set; }
    public int Abertos { get; set; }
    public int EmAtendimento { get; set; }
    public int Resolvidos { get; set; }
    public int Fechados { get; set; }
    public int Criticos { get; set; }
    public List<CategoriaStatResponse> PorCategoria { get; set; } = [];
    public List<DiaStat> PorDia { get; set; } = [];
}

public class CategoriaStatResponse
{
    public string Nome { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}

public class DiaStat
{
    public string Label { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}
