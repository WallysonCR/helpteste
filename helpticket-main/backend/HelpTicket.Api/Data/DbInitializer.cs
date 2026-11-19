using HelpTicket.Api.Enums;
using HelpTicket.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HelpTicket.Api.Data;

public static class DbInitializer
{
    public static async Task InicializarAsync(
        IServiceProvider services)
    {
        using var scope =
            services.CreateScope();


        var context =
            scope.ServiceProvider
                .GetRequiredService<AppDbContext>();


        var passwordHasher =
            scope.ServiceProvider
                .GetRequiredService<
                    IPasswordHasher<Usuario>
                >();

        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync();
        }


        if (!await context.Categorias.AnyAsync())
        {
            context.Categorias.AddRange(
                new Categoria { Nome = "Hardware", Descricao = "Problemas relacionados a equipamentos.", Ativa = true },
                new Categoria { Nome = "Software", Descricao = "Problemas relacionados a sistemas e aplicativos.", Ativa = true },
                new Categoria { Nome = "Rede", Descricao = "Problemas relacionados a conexão e rede.", Ativa = true }
            );
            await context.SaveChangesAsync();
        }

        if (!await context.Usuarios.AnyAsync())
        {
            var solicitante1 = new Usuario { Nome = "Usuário Teste", Email = "usuario@helpticket.com", TipoUsuario = TipoUsuario.Solicitante, Ativo = true, DataCriacao = DateTime.UtcNow };
            solicitante1.SenhaHash = passwordHasher.HashPassword(solicitante1, "123456");

            var solicitante2 = new Usuario { Nome = "Maria Oliveira", Email = "maria@helpticket.com", TipoUsuario = TipoUsuario.Solicitante, Ativo = true, DataCriacao = DateTime.UtcNow };
            solicitante2.SenhaHash = passwordHasher.HashPassword(solicitante2, "123456");

            var solicitante3 = new Usuario { Nome = "Carlos Mendes", Email = "carlos@helpticket.com", TipoUsuario = TipoUsuario.Solicitante, Ativo = true, DataCriacao = DateTime.UtcNow };
            solicitante3.SenhaHash = passwordHasher.HashPassword(solicitante3, "123456");

            var agente1 = new Usuario { Nome = "Jarlan Ferreira", Email = "jarlan@helpticket.com", TipoUsuario = TipoUsuario.Agente, Ativo = true, DataCriacao = DateTime.UtcNow };
            agente1.SenhaHash = passwordHasher.HashPassword(agente1, "123456");

            var agente2 = new Usuario { Nome = "André Vasconcelos", Email = "andre@helpticket.com", TipoUsuario = TipoUsuario.Agente, Ativo = true, DataCriacao = DateTime.UtcNow };
            agente2.SenhaHash = passwordHasher.HashPassword(agente2, "123456");

            var agente3 = new Usuario { Nome = "Leonardo Lucena", Email = "leonardo@helpticket.com", TipoUsuario = TipoUsuario.Agente, Ativo = true, DataCriacao = DateTime.UtcNow };
            agente3.SenhaHash = passwordHasher.HashPassword(agente3, "123456");

            var admin = new Usuario { Nome = "Administrador", Email = "admin@helpticket.com", TipoUsuario = TipoUsuario.Administrador, Ativo = true, DataCriacao = DateTime.UtcNow };
            admin.SenhaHash = passwordHasher.HashPassword(admin, "admin123");

            context.Usuarios.AddRange(solicitante1, solicitante2, solicitante3, agente1, agente2, agente3, admin);
            await context.SaveChangesAsync();

            var categorias = await context.Categorias.ToListAsync();
            var catHardware = categorias.First(c => c.Nome == "Hardware");
            var catSoftware = categorias.First(c => c.Nome == "Software");
            var catRede = categorias.First(c => c.Nome == "Rede");

            var tickets = new List<Ticket>
            {
                new Ticket { Titulo = "Impressora não imprime", Descricao = "A impressora do setor fiscal parou de funcionar após atualização do Windows.", Status = StatusTicket.Aberto, Prioridade = PrioridadeTicket.Alta, IdCategoria = catHardware.IdCategoria, IdSolicitante = solicitante1.IdUsuario, DataAbertura = DateTime.UtcNow.AddDays(-5) },
                new Ticket { Titulo = "Excel travando ao abrir planilhas grandes", Descricao = "O Excel fecha sozinho ao tentar abrir arquivos com mais de 10MB.", Status = StatusTicket.EmAtendimento, Prioridade = PrioridadeTicket.Media, IdCategoria = catSoftware.IdCategoria, IdSolicitante = solicitante2.IdUsuario, IdAgente = agente1.IdUsuario, DataAbertura = DateTime.UtcNow.AddDays(-3) },
                new Ticket { Titulo = "Sem acesso à internet", Descricao = "Computadores do setor de RH estão sem acesso à internet desde ontem.", Status = StatusTicket.EmAtendimento, Prioridade = PrioridadeTicket.Critica, IdCategoria = catRede.IdCategoria, IdSolicitante = solicitante3.IdUsuario, IdAgente = agente2.IdUsuario, DataAbertura = DateTime.UtcNow.AddDays(-1) },
                new Ticket { Titulo = "Monitor com tela piscando", Descricao = "O monitor da recepção fica piscando intermitentemente.", Status = StatusTicket.Aberto, Prioridade = PrioridadeTicket.Baixa, IdCategoria = catHardware.IdCategoria, IdSolicitante = solicitante1.IdUsuario, DataAbertura = DateTime.UtcNow.AddDays(-2) },
                new Ticket { Titulo = "Sistema ERP não abre", Descricao = "Erro ao iniciar o ERP: 'Falha na conexão com o servidor de banco de dados'.", Status = StatusTicket.Resolvido, Prioridade = PrioridadeTicket.Alta, IdCategoria = catSoftware.IdCategoria, IdSolicitante = solicitante2.IdUsuario, IdAgente = agente3.IdUsuario, DataAbertura = DateTime.UtcNow.AddDays(-7) },
                new Ticket { Titulo = "VPN não conecta fora do escritório", Descricao = "Funcionários em home office não conseguem conectar à VPN corporativa.", Status = StatusTicket.Aberto, Prioridade = PrioridadeTicket.Alta, IdCategoria = catRede.IdCategoria, IdSolicitante = solicitante3.IdUsuario, DataAbertura = DateTime.UtcNow.AddDays(-4) },
                new Ticket { Titulo = "Teclado com teclas travadas", Descricao = "Algumas teclas do teclado do notebook da diretoria não respondem.", Status = StatusTicket.Fechado, Prioridade = PrioridadeTicket.Baixa, IdCategoria = catHardware.IdCategoria, IdSolicitante = solicitante1.IdUsuario, IdAgente = agente1.IdUsuario, DataAbertura = DateTime.UtcNow.AddDays(-10) },
                new Ticket { Titulo = "Antivírus desatualizado em 15 máquinas", Descricao = "O antivírus não atualiza automaticamente nas máquinas do laboratório.", Status = StatusTicket.EmAtendimento, Prioridade = PrioridadeTicket.Media, IdCategoria = catSoftware.IdCategoria, IdSolicitante = solicitante2.IdUsuario, IdAgente = agente2.IdUsuario, DataAbertura = DateTime.UtcNow.AddDays(-6) },
            };

            context.Tickets.AddRange(tickets);
            await context.SaveChangesAsync();

            var comentariosIniciais = new List<Comentario>
            {
                new Comentario
                {
                    IdTicket = tickets[1].IdTicket,
                    IdUsuario = agente1.IdUsuario,
                    Mensagem = "Olá Maria, estou verificando o consumo de memória do Office na sua máquina remotamente.",
                    Interno = false,
                    DataEnvio = DateTime.UtcNow.AddDays(-2)
                },
                new Comentario
                {
                    IdTicket = tickets[2].IdTicket,
                    IdUsuario = agente2.IdUsuario,
                    Mensagem = "Identificamos queda no switch do 2º andar. Equipe de infraestrutura já está trocando a porta.",
                    Interno = false,
                    DataEnvio = DateTime.UtcNow.AddHours(-5)
                }
            };
            context.Comentarios.AddRange(comentariosIniciais);

            var notificacoesIniciais = new List<Notificacao>
            {
                new Notificacao
                {
                    IdTicket = tickets[0].IdTicket,
                    IdUsuario = solicitante1.IdUsuario,
                    Tipo = TipoNotificacao.TicketCriado,
                    Mensagem = $"Seu chamado #{tickets[0].IdTicket} ({tickets[0].Titulo}) foi recebido pela fila de suporte.",
                    DataEnvio = DateTime.UtcNow.AddHours(-3),
                    Lida = false
                },
                new Notificacao
                {
                    IdTicket = tickets[4].IdTicket,
                    IdUsuario = agente3.IdUsuario,
                    Tipo = TipoNotificacao.StatusAlterado,
                    Mensagem = $"O chamado #{tickets[4].IdTicket} ({tickets[4].Titulo}) foi marcado como Resolvido.",
                    DataEnvio = DateTime.UtcNow.AddDays(-1),
                    Lida = false
                },
                new Notificacao
                {
                    IdTicket = tickets[2].IdTicket,
                    IdUsuario = admin.IdUsuario,
                    Tipo = TipoNotificacao.TicketCriado,
                    Mensagem = $"Chamado crítico aberto: #{tickets[2].IdTicket} - {tickets[2].Titulo}.",
                    DataEnvio = DateTime.UtcNow.AddHours(-6),
                    Lida = false
                }
            };
            context.Notificacoes.AddRange(notificacoesIniciais);
            await context.SaveChangesAsync();
        }
    }
}