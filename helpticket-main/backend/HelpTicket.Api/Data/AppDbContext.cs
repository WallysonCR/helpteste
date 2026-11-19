using HelpTicket.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpTicket.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();

    public DbSet<Categoria> Categorias => Set<Categoria>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<Comentario> Comentarios => Set<Comentario>();

    public DbSet<Anexo> Anexos => Set<Anexo>();

    public DbSet<Historico> Historicos => Set<Historico>();

    public DbSet<Notificacao> Notificacoes => Set<Notificacao>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // =========================
        // USUARIO
        // =========================

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(u => u.IdUsuario);

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.Nome)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(u => u.SenhaHash)
                .IsRequired();

            entity.Property(u => u.TipoUsuario)
                .HasConversion<string>();
        });


        // =========================
        // CATEGORIA
        // =========================

        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(c => c.IdCategoria);

            entity.Property(c => c.Nome)
                .IsRequired()
                .HasMaxLength(100);
        });


        // =========================
        // TICKET
        // =========================

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(t => t.IdTicket);

            entity.Property(t => t.Titulo)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(t => t.Descricao)
                .IsRequired();

            entity.Property(t => t.Status)
                .HasConversion<string>();

            entity.Property(t => t.Prioridade)
                .HasConversion<string>();


            entity.HasOne(t => t.Solicitante)
                .WithMany(u => u.TicketsSolicitados)
                .HasForeignKey(t => t.IdSolicitante)
                .OnDelete(DeleteBehavior.Restrict);


            entity.HasOne(t => t.Agente)
                .WithMany(u => u.TicketsAtendidos)
                .HasForeignKey(t => t.IdAgente)
                .OnDelete(DeleteBehavior.Restrict);


            entity.HasOne(t => t.Categoria)
                .WithMany(c => c.Tickets)
                .HasForeignKey(t => t.IdCategoria)
                .OnDelete(DeleteBehavior.Restrict);
        });


        // =========================
        // COMENTARIO
        // =========================

        modelBuilder.Entity<Comentario>(entity =>
        {
            entity.HasKey(c => c.IdComentario);

            entity.Property(c => c.Mensagem)
                .IsRequired();

            entity.HasOne(c => c.Ticket)
                .WithMany(t => t.Comentarios)
                .HasForeignKey(c => c.IdTicket)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Usuario)
                .WithMany(u => u.Comentarios)
                .HasForeignKey(c => c.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);
        });


        // =========================
        // ANEXO
        // =========================

        modelBuilder.Entity<Anexo>(entity =>
        {
            entity.HasKey(a => a.IdAnexo);

            entity.HasOne(a => a.Ticket)
                .WithMany(t => t.Anexos)
                .HasForeignKey(a => a.IdTicket)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // =========================
        // HISTORICO
        // =========================

        modelBuilder.Entity<Historico>(entity =>
        {
            entity.HasKey(h => h.IdHistorico);

            entity.HasOne(h => h.Ticket)
                .WithMany(t => t.Historicos)
                .HasForeignKey(h => h.IdTicket)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(h => h.Usuario)
                .WithMany(u => u.Historicos)
                .HasForeignKey(h => h.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);
        });


        // =========================
        // NOTIFICACAO
        // =========================

        modelBuilder.Entity<Notificacao>(entity =>
        {
            entity.HasKey(n => n.IdNotificacao);

            entity.Property(n => n.Tipo)
                .HasConversion<string>();

            entity.HasOne(n => n.Ticket)
                .WithMany(t => t.Notificacoes)
                .HasForeignKey(n => n.IdTicket)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(n => n.Usuario)
                .WithMany(u => u.Notificacoes)
                .HasForeignKey(n => n.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}