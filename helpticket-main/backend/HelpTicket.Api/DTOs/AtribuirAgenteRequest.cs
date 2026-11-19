using System.ComponentModel.DataAnnotations;

namespace HelpTicket.Api.DTOs;

public class AtribuirAgenteRequest
{
    [Required]
    public int IdAgente { get; set; }
}
