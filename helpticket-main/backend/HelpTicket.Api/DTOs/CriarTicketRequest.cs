using System.ComponentModel.DataAnnotations;
using HelpTicket.Api.Enums;

namespace HelpTicket.Api.DTOs;

public class CriarTicketRequest
{
    [Required]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required]
    public string Descricao { get; set; } = string.Empty;

    [Required]
    public PrioridadeTicket Prioridade { get; set; }

    [Required]
    public int IdCategoria { get; set; }
}