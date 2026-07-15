using Domain.Entities;

namespace Domain.Interfaces;

public interface IAvaliacaoRepository
{
    Task<Avaliacao?> GetByIdAsync(string id, CancellationToken ct);
    Task<IReadOnlyList<Avaliacao>> ListAsync(CancellationToken ct);
    Task<IReadOnlyList<Avaliacao>> ListByClienteIdAsync(int clienteId, CancellationToken ct);
    Task AddAsync(Avaliacao avaliacao, CancellationToken ct);
    Task SaveAsync(CancellationToken ct);
}