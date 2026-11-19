using HelpTicket.Api.Data;
using HelpTicket.Api.DTOs;
using HelpTicket.Api.Enums;
using HelpTicket.Api.Repositories;
using HelpTicket.Api.Services;
using HelpTicket.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace HelpTicket.Tests.Services;

public class TicketServiceTests
{
    private static TicketService CriarServico(AppDbContext context) =>
        new(new TicketRepository(context), new CategoriaRepository(context));

    // ==========================
    // ABERTURA DE CHAMADO (RF02)
    // ==========================

    [Fact]
    public async Task Criar_ComCategoriaValida_AbreChamadoComStatusAbertoESemAgente()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var ticket = await service.CriarAsync(new CriarTicketRequest
        {
            Titulo = "Webcam não funciona",
            Descricao = "Não aparece imagem no Meet",
            Prioridade = PrioridadeTicket.Media,
            IdCategoria = c.Hardware.IdCategoria
        }, c.Solicitante.IdUsuario);

        Assert.NotNull(ticket);
        Assert.True(ticket!.IdTicket > 0);
        Assert.Equal(StatusTicket.Aberto, ticket.Status);
        Assert.Null(ticket.IdAgente);
        Assert.Equal(c.Solicitante.IdUsuario, ticket.IdSolicitante);
        Assert.Null(ticket.DataResolucao);
        Assert.Null(ticket.DataFechamento);
    }

    [Fact]
    public async Task Criar_ComCategoriaInexistente_RetornaNull()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var ticket = await service.CriarAsync(new CriarTicketRequest
        {
            Titulo = "Teste",
            Descricao = "Teste",
            Prioridade = PrioridadeTicket.Baixa,
            IdCategoria = 9999
        }, c.Solicitante.IdUsuario);

        Assert.Null(ticket);
    }

    [Fact]
    public async Task Criar_ComCategoriaInativa_RetornaNull()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var ticket = await service.CriarAsync(new CriarTicketRequest
        {
            Titulo = "Teste",
            Descricao = "Teste",
            Prioridade = PrioridadeTicket.Baixa,
            IdCategoria = c.Inativa.IdCategoria
        }, c.Solicitante.IdUsuario);

        Assert.Null(ticket);
    }

    // ==========================
    // LISTAGEM E RBAC
    // ==========================

    [Fact]
    public async Task Listar_SemFiltros_RetornaTodosOrdenadosDoMaisRecente()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.ListarAsync(1, 10, null, null);

        Assert.Equal(5, resultado.Total);
        Assert.Equal(5, resultado.Items.Count);
        Assert.Equal("ERP lento", resultado.Items.First().Titulo);
        Assert.True(resultado.Items.Zip(resultado.Items.Skip(1)).All(p => p.First.DataAbertura >= p.Second.DataAbertura));
    }

    [Fact]
    public async Task Listar_ComoSolicitante_RetornaApenasChamadosDele()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.ListarAsync(1, 10, null, null, idSolicitante: c.Solicitante.IdUsuario);

        Assert.Equal(3, resultado.Total);
        Assert.All(resultado.Items, t => Assert.Equal(c.Solicitante.IdUsuario, t.IdSolicitante));
    }

    [Fact]
    public async Task Listar_ComoAgente_RetornaApenasChamadosAtribuidosAEle()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.ListarAsync(1, 10, null, null, idAgente: c.Agente.IdUsuario);

        Assert.Equal(4, resultado.Total);
        Assert.All(resultado.Items, t => Assert.Equal(c.Agente.IdUsuario, t.IdAgente));
    }

    [Fact]
    public async Task Listar_FiltrandoPorStatus_RetornaSomenteStatusInformado()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.ListarAsync(1, 10, StatusTicket.EmAtendimento, null);

        Assert.Equal(2, resultado.Total);
        Assert.All(resultado.Items, t => Assert.Equal("EmAtendimento", t.Status));
    }

    [Fact]
    public async Task Listar_ComBusca_IgnoraMaiusculasEMinusculas()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var resultado = await service.ListarAsync(1, 10, null, "IMPRESSORA");

        Assert.Single(resultado.Items);
        Assert.Equal("Impressora parada", resultado.Items[0].Titulo);
    }

    [Fact]
    public async Task Listar_ComPaginacao_RespeitaTamanhoDaPaginaEMantemTotal()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var pagina1 = await service.ListarAsync(1, 2, null, null);
        var pagina3 = await service.ListarAsync(3, 2, null, null);

        Assert.Equal(2, pagina1.Items.Count);
        Assert.Single(pagina3.Items);
        Assert.Equal(5, pagina3.Total);
    }

    [Fact]
    public async Task ObterPorId_Inexistente_RetornaNull()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        Assert.Null(await service.ObterPorIdAsync(9999));
    }

    [Fact]
    public async Task ObterPorId_Existente_RetornaDetalhesComSolicitanteECategoria()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var detalhe = await service.ObterPorIdAsync(c.Tickets[1].IdTicket);

        Assert.NotNull(detalhe);
        Assert.Equal("Excel travando", detalhe!.Titulo);
        Assert.Equal("Cliente Um", detalhe.NomeSolicitante);
        Assert.Equal("cliente1@teste.com", detalhe.EmailSolicitante);
        Assert.Equal("Agente Um", detalhe.NomeAgente);
        Assert.Equal("Software", detalhe.NomeCategoria);
    }

    // ==========================
    // CICLO DE VIDA (RF03)
    // ==========================

    [Fact]
    public async Task AtualizarStatus_ParaResolvido_RegistraDataDeResolucaoENotificaSolicitante()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);
        var ticket = c.Tickets[1];

        await service.AtualizarStatusAsync(ticket.IdTicket, StatusTicket.Resolvido);

        var atualizado = await context.Tickets.AsNoTracking().FirstAsync(t => t.IdTicket == ticket.IdTicket);
        Assert.Equal(StatusTicket.Resolvido, atualizado.Status);
        Assert.NotNull(atualizado.DataResolucao);

        var notificacao = await context.Notificacoes.SingleAsync();
        Assert.Equal(c.Solicitante.IdUsuario, notificacao.IdUsuario);
        Assert.Equal(TipoNotificacao.StatusAlterado, notificacao.Tipo);
        Assert.False(notificacao.Lida);
    }

    [Fact]
    public async Task AtualizarStatus_ParaFechado_RegistraDataDeFechamento()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        await service.AtualizarStatusAsync(c.Tickets[4].IdTicket, StatusTicket.Fechado);

        var atualizado = await context.Tickets.AsNoTracking().FirstAsync(t => t.IdTicket == c.Tickets[4].IdTicket);
        Assert.Equal(StatusTicket.Fechado, atualizado.Status);
        Assert.NotNull(atualizado.DataFechamento);
    }

    [Fact]
    public async Task AtualizarStatus_ChamadoInexistente_NaoLancaExcecaoNemNotifica()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        await service.AtualizarStatusAsync(9999, StatusTicket.Resolvido);

        Assert.Empty(context.Notificacoes);
    }

    [Fact]
    public async Task AtribuirAgente_EmChamadoAberto_MudaParaEmAtendimentoENotificaAgente()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);
        var ticket = c.Tickets[0];

        await service.AtribuirAgenteAsync(ticket.IdTicket, c.Agente.IdUsuario);

        var atualizado = await context.Tickets.AsNoTracking().FirstAsync(t => t.IdTicket == ticket.IdTicket);
        Assert.Equal(c.Agente.IdUsuario, atualizado.IdAgente);
        Assert.Equal(StatusTicket.EmAtendimento, atualizado.Status);

        var notificacao = await context.Notificacoes.SingleAsync();
        Assert.Equal(c.Agente.IdUsuario, notificacao.IdUsuario);
        Assert.Equal(TipoNotificacao.TicketAtribuido, notificacao.Tipo);
    }

    [Fact]
    public async Task AtribuirAgente_EmChamadoResolvido_MantemStatus()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);
        var ticket = c.Tickets[4];

        await service.AtribuirAgenteAsync(ticket.IdTicket, c.Agente.IdUsuario);

        var atualizado = await context.Tickets.AsNoTracking().FirstAsync(t => t.IdTicket == ticket.IdTicket);
        Assert.Equal(StatusTicket.Resolvido, atualizado.Status);
    }

    // ==========================
    // COMENTÁRIOS E NOTIFICAÇÕES (RF03/RF04)
    // ==========================

    [Fact]
    public async Task AdicionarComentario_PeloAgente_SalvaComentarioENotificaSolicitante()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);
        var ticket = c.Tickets[1];

        var comentario = await service.AdicionarComentarioAsync(
            ticket.IdTicket, c.Agente.IdUsuario, new CriarComentarioRequest { Mensagem = "Reinicie o Excel" });

        Assert.NotNull(comentario);
        Assert.Equal("Reinicie o Excel", comentario!.Mensagem);
        Assert.Equal("Agente Um", comentario.NomeAutor);

        var notificacao = await context.Notificacoes.SingleAsync();
        Assert.Equal(c.Solicitante.IdUsuario, notificacao.IdUsuario);
        Assert.Equal(TipoNotificacao.ComentarioAdicionado, notificacao.Tipo);
    }

    [Fact]
    public async Task AdicionarComentario_PeloSolicitante_NotificaAgenteResponsavel()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        await service.AdicionarComentarioAsync(
            c.Tickets[1].IdTicket, c.Solicitante.IdUsuario, new CriarComentarioRequest { Mensagem = "Não resolveu" });

        var notificacao = await context.Notificacoes.SingleAsync();
        Assert.Equal(c.Agente.IdUsuario, notificacao.IdUsuario);
    }

    [Fact]
    public async Task AdicionarComentario_ApareceNoDetalheDoChamado()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        await service.AdicionarComentarioAsync(
            c.Tickets[1].IdTicket, c.Agente.IdUsuario, new CriarComentarioRequest { Mensagem = "Primeira resposta" });

        var detalhe = await service.ObterPorIdAsync(c.Tickets[1].IdTicket);

        Assert.Single(detalhe!.Comentarios);
        Assert.Equal("Primeira resposta", detalhe.Comentarios[0].Mensagem);
    }

    [Fact]
    public async Task AdicionarComentario_EmChamadoInexistente_RetornaNull()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var comentario = await service.AdicionarComentarioAsync(
            9999, c.Agente.IdUsuario, new CriarComentarioRequest { Mensagem = "Teste" });

        Assert.Null(comentario);
        Assert.Empty(context.Notificacoes);
    }

    // ==========================
    // ANEXOS
    // ==========================

    [Fact]
    public async Task SalvarAnexos_VinculaArquivosAoChamado()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        await service.SalvarAnexosAsync(c.Tickets[0].IdTicket,
        [
            new AnexoItem { NomeArquivo = "print.png", TipoArquivo = "image/png", TamanhoKb = 120, Caminho = "https://cdn/print.png" },
            new AnexoItem { NomeArquivo = "log.txt", TipoArquivo = "text/plain", TamanhoKb = 2, Caminho = "https://cdn/log.txt" }
        ]);

        var detalhe = await service.ObterPorIdAsync(c.Tickets[0].IdTicket);
        Assert.Equal(2, detalhe!.Anexos.Count);
        Assert.Contains(detalhe.Anexos, a => a.NomeArquivo == "print.png" && a.TamanhoKb == 120);
    }

    // ==========================
    // RELATÓRIOS (RF05)
    // ==========================

    [Fact]
    public async Task ObterStats_Global_ContabilizaTodosOsChamados()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var stats = await service.ObterStatsAsync();

        Assert.Equal(5, stats.Total);
        Assert.Equal(1, stats.Abertos);
        Assert.Equal(2, stats.EmAtendimento);
        Assert.Equal(1, stats.Resolvidos);
        Assert.Equal(1, stats.Fechados);
    }

    [Fact]
    public async Task ObterStats_Criticos_DesconsideraChamadosFechados()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var stats = await service.ObterStatsAsync();

        // 2 chamados críticos no cenário, mas um deles está Fechado
        Assert.Equal(1, stats.Criticos);
    }

    [Fact]
    public async Task ObterStats_PorSolicitante_ContabilizaSomenteChamadosDele()
    {
        using var context = TestDbFactory.CriarContexto();
        var c = await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var stats = await service.ObterStatsAsync(c.OutroSolicitante.IdUsuario);

        Assert.Equal(2, stats.Total);
        Assert.Equal(0, stats.Abertos);
        Assert.Equal(1, stats.EmAtendimento);
        Assert.Equal(1, stats.Fechados);
    }

    [Fact]
    public async Task ObterStats_AgrupaPorCategoriaEUltimosSeteDias()
    {
        using var context = TestDbFactory.CriarContexto();
        await TestDbFactory.CriarCenarioAsync(context);
        var service = CriarServico(context);

        var stats = await service.ObterStatsAsync();

        Assert.Equal(7, stats.PorDia.Count);
        Assert.Equal("Hardware", stats.PorCategoria.First().Nome);
        Assert.Equal(3, stats.PorCategoria.First(c => c.Nome == "Hardware").Quantidade);
        Assert.Equal(2, stats.PorCategoria.First(c => c.Nome == "Software").Quantidade);
        Assert.Equal(5, stats.PorDia.Sum(d => d.Quantidade)); // todos os 5 chamados do cenário foram abertos nos últimos 7 dias
    }
}
