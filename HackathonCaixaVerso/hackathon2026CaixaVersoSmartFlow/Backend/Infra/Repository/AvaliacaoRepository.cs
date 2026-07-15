using Domain.Entities;
using Domain.Interfaces;
using Infra.Data;
using Microsoft.EntityFrameworkCore;

namespace Infra.Repository;

public sealed class AvaliacaoRepository(LeituraContext dbLeitura, EscritaContext dbEscrita) : IAvaliacaoRepository
{
    public Task<Avaliacao?> GetByIdAsync(string id, CancellationToken ct)
        => dbLeitura.Avaliacao.FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<IReadOnlyList<Avaliacao>> ListAsync(CancellationToken ct)
    {
        return await dbLeitura.Avaliacao
            .OrderByDescending(a => a.DataHoraAvaliacao)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Avaliacao>> ListByClienteIdAsync(int clienteId, CancellationToken ct)
    {
        return await dbLeitura.Avaliacao
            .Where(a => a.ClienteId == clienteId)
            .OrderByDescending(a => a.DataHoraAvaliacao)
            .ToListAsync(ct);
    }

    public Task AddAsync(Avaliacao avaliacao, CancellationToken ct)
    {
        dbEscrita.Avaliacao.Add(avaliacao);
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken ct) => dbEscrita.SaveChangesAsync(ct);
}