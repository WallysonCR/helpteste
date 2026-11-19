using System.ComponentModel.DataAnnotations;
using HelpTicket.Api.Enums;

namespace HelpTicket.Api.DTOs;

public class AtualizarStatusRequest
{
    [Required]
    public StatusTicket Status { get; set; }
}
