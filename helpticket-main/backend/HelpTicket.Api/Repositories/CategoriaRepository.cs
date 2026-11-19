using HelpTicket.Api.Data;
using HelpTicket.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpTicket.Api.Repositories;

public class CategoriaRepository
{
    private readonly AppDbContext _context;

    public CategoriaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Categoria?> ObterPorIdAsync(int idCategoria)
    {
        return await _context.Categorias
            .FirstOrDefaultAsync(c =>
                c.IdCategoria == idCategoria &&
                c.Ativa
            );
    }
}