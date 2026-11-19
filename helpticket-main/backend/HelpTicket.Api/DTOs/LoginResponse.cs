using HelpTicket.Api.Enums;

namespace HelpTicket.Api.DTOs;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiraEm { get; set; }

    public int IdUsuario { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public TipoUsuario TipoUsuario { get; set; }
}