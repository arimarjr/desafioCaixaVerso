using Domain.Entities;
using Domain.Interfaces;
using Domain.ValueObjects;
using Infra.Data;
using Microsoft.EntityFrameworkCore;

namespace Infra.Repository;

public sealed class ClienteRepository(LeituraContext dbLeitura, EscritaContext dbEscrita) : IClienteRepository
{
    public Task<Cliente?> GetByIdAsync(int id, CancellationToken ct)
        => dbLeitura.Cliente.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<Cliente?> GetByCnpjAsync(Cnpj cnpj, CancellationToken ct)
    {
        return dbLeitura.Cliente.FirstOrDefaultAsync(c => c.Cnpj == cnpj, ct);
    }

    public async Task<bool> ExistsCnpjAsync(Cnpj cnpj, CancellationToken ct)
    {
        return await dbLeitura.Cliente.AnyAsync(c => c.Cnpj == cnpj, ct);
    }

    public async Task<(IReadOnlyList<Cliente> Items, int Total)> ListAsync(string? razaoSocial, Cnpj? cnpj, int page, int size, CancellationToken ct)
    {
        var q = dbLeitura.Cliente.AsQueryable();
        if (!string.IsNullOrWhiteSpace(razaoSocial))
        {
            // SQLite: LIKE é case-insensitive em ASCII por padrão (PRAGMA case_sensitive_like=OFF). EF.Functions.Like delega para SQL LIKE.
            var pattern = $"%{razaoSocial}%";
            q = q.Where(c => EF.Functions.Like(c.RazaoSocial, pattern));
        }
        if (cnpj.HasValue)
        {
            q = q.Where(c => c.Cnpj == cnpj.Value);
        }
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(c => c.RazaoSocial).Skip((page - 1) * size).Take(size).ToListAsync(ct);
        return (items, total);
    }

    public Task AddAsync(Cliente cliente, CancellationToken ct)
    {
        dbEscrita.Cliente.Add(cliente);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken ct) => dbEscrita.SaveChangesAsync(ct);
}
