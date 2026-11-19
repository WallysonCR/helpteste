using HelpTicket.Api.Data;
using HelpTicket.Api.Enums;
using HelpTicket.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HelpTicket.Tests.Helpers;

/// <summary>
/// Cria um AppDbContext isolado (banco em memória único por teste)
/// e oferece um cenário padrão de dados para os testes.
/// </summary>
public static class TestDbFactory
{
    public static AppDbContext CriarContexto()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"HelpTicketTests-{Guid.NewGuid()}")
            .Options;

        return new AppDbContext(options);
    }

    public static async Task<Cenario> CriarCenarioAsync(AppDbContext context)
    {
        var hasher = new PasswordHasher<Usuario>();

        var hardware = new Categoria { Nome = "Hardware", Ativa = true };
        var software = new Categoria { Nome = "Software", Ativa = true };
        var inativa = new Categoria { Nome = "Legado", Ativa = false };
        context.Categorias.AddRange(hardware, software, inativa);

        var solicitante = NovoUsuario("Cliente Um", "cliente1@teste.com", TipoUsuario.Solicitante, hasher);
        var outroSolicitante = NovoUsuario("Cliente Dois", "cliente2@teste.com", TipoUsuario.Solicitante, hasher);
        var agente = NovoUsuario("Agente Um", "agente@teste.com", TipoUsuario.Agente, hasher);
        var admin = NovoUsuario("Admin", "admin@teste.com", TipoUsuario.Administrador, hasher);
        context.Usuarios.AddRange(solicitante, outroSolicitante, agente, admin);

        await context.SaveChangesAsync();

        var agora = DateTime.UtcNow;
        var tickets = new List<Ticket>
        {
            NovoTicket("Impressora parada", StatusTicket.Aberto, PrioridadeTicket.Alta, hardware, solicitante, null, agora.AddDays(-3)),
            NovoTicket("Excel travando", StatusTicket.EmAtendimento, PrioridadeTicket.Media, software, solicitante, agente, agora.AddDays(-2)),
            NovoTicket("Sem internet", StatusTicket.EmAtendimento, PrioridadeTicket.Critica, hardware, outroSolicitante, agente, agora.AddDays(-1)),
            NovoTicket("Monitor quebrado", StatusTicket.Fechado, PrioridadeTicket.Critica, hardware, outroSolicitante, agente, agora.AddDays(-5)),
            NovoTicket("ERP lento", StatusTicket.Resolvido, PrioridadeTicket.Baixa, software, solicitante, agente, agora),
        };
        context.Tickets.AddRange(tickets);
        await context.SaveChangesAsync();

        return new Cenario(hardware, software, inativa, solicitante, outroSolicitante, agente, admin, tickets);
    }

    private static Usuario NovoUsuario(string nome, string email, TipoUsuario tipo, PasswordHasher<Usuario> hasher)
    {
        var usuario = new Usuario
        {
            Nome = nome,
            Email = email,
            TipoUsuario = tipo,
            Ativo = true,
            DataCriacao = DateTime.UtcNow
        };
        usuario.SenhaHash = hasher.HashPassword(usuario, "123456");
        return usuario;
    }

    private static Ticket NovoTicket(
        string titulo, StatusTicket status, PrioridadeTicket prioridade,
        Categoria categoria, Usuario solicitante, Usuario? agente, DateTime abertura)
    {
        return new Ticket
        {
            Titulo = titulo,
            Descricao = $"Descrição de {titulo}",
            Status = status,
            Prioridade = prioridade,
            IdCategoria = categoria.IdCategoria,
            IdSolicitante = solicitante.IdUsuario,
            IdAgente = agente?.IdUsuario,
            DataAbertura = abertura
        };
    }
}

public record Cenario(
    Categoria Hardware,
    Categoria Software,
    Categoria Inativa,
    Usuario Solicitante,
    Usuario OutroSolicitante,
    Usuario Agente,
    Usuario Admin,
    List<Ticket> Tickets);
