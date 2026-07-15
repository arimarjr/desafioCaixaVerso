using Domain.Entities;
using Domain.ValueObjects;

namespace Domain.Interfaces;

public interface IClienteRepository
{
    Task<Cliente?> GetByIdAsync(int id, CancellationToken ct);
    Task<Cliente?> GetByCnpjAsync(Cnpj cnpj, CancellationToken ct);
    Task<bool> ExistsCnpjAsync(Cnpj cnpj, CancellationToken ct);
    Task<(IReadOnlyList<Cliente> Items, int Total)> ListAsync(string? nome, Cnpj? cnpj, int page, int size, CancellationToken ct);
    Task AddAsync(Cliente cliente, CancellationToken ct);
    Task SaveAsync(CancellationToken ct);
}
