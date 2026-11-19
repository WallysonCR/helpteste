using System.IdentityModel.Tokens.Jwt;
using HelpTicket.Api.Data;
using HelpTicket.Api.DTOs;
using HelpTicket.Api.Enums;
using HelpTicket.Api.Models;
using HelpTicket.Api.Repositories;
using HelpTicket.Api.Services;
using HelpTicket.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace HelpTicket.Tests.Services;

public class AuthServiceTests
{
    private static IConfiguration CriarConfiguracao() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "ChaveDeTesteDoHelpTicketComMaisDe32Caracteres!!",
                ["Jwt:Issuer"] = "HelpTicket.Api",
                ["Jwt:Audience"] = "HelpTicket.React"
            })
            .Build();

    private static AuthService CriarServico(AppDbContext context) =>
        new(new UsuarioRepository(context), CriarConfiguracao(), new PasswordHasher<Usuario>());

    [Fact]
    public async Task Login_ComCredenciaisValidas_RetornaTokenEDadosDoUsuario()
    {
        using var context = TestDbFactory.CriarContexto();
        var cenario = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.LoginAsync(new LoginRequest { Email = "agente@teste.com", Senha = "123456" });

        Assert.NotNull(resultado);
        Assert.False(string.IsNullOrWhiteSpace(resultado!.Token));
        Assert.Equal(cenario.Agente.IdUsuario, resultado.IdUsuario);
        Assert.Equal("Agente Um", resultado.Nome);
        Assert.Equal("agente@teste.com", resultado.Email);
        Assert.Equal(TipoUsuario.Agente, resultado.TipoUsuario);
        Assert.True(resultado.ExpiraEm > DateTime.UtcNow);
    }

    [Fact]
    public async Task Login_TokenGerado_ContemIssuerAudienceEPerfil()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.LoginAsync(new LoginRequest { Email = "admin@teste.com", Senha = "123456" });
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(resultado!.Token);

        Assert.Equal("HelpTicket.Api", jwt.Issuer);
        Assert.Contains("HelpTicket.React", jwt.Audiences);
        Assert.Contains(jwt.Claims, c => c.Value == nameof(TipoUsuario.Administrador));
        Assert.Contains(jwt.Claims, c => c.Value == "admin@teste.com");
    }

    [Fact]
    public async Task Login_ComSenhaIncorreta_RetornaNull()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.LoginAsync(new LoginRequest { Email = "agente@teste.com", Senha = "senha-errada" });

        Assert.Null(resultado);
    }

    [Fact]
    public async Task Login_ComEmailInexistente_RetornaNull()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.LoginAsync(new LoginRequest { Email = "naoexiste@teste.com", Senha = "123456" });

        Assert.Null(resultado);
    }

    [Fact]
    public async Task Login_ComUsuarioInativo_RetornaNull()
    {
        using var context = TestDbFactory.CriarContexto();
        var cenario = await TestDbFactory.CriarCenarioAsync(context);
        cenario.Solicitante.Ativo = false;
        await context.SaveChangesAsync();
        var service = CriarServico(context);

        var resultado = await service.LoginAsync(new LoginRequest { Email = "cliente1@teste.com", Senha = "123456" });

        Assert.Null(resultado);
    }
}
