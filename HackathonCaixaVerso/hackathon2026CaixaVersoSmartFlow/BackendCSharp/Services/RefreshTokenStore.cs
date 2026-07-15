using System.Collections.Concurrent;

// =============================================================================
// STORE DE REFRESH TOKENS — In-memory (thread-safe)
// Em produção: substituir por Redis ou tabela de banco com TTL.
// =============================================================================

class RefreshTokenStore : IRefreshTokenStore
{
    private readonly ConcurrentDictionary<string, RefreshTokenEntry> _store = new();

    public void Armazenar(string token, string matricula, DateTime expiracao) =>
        _store[token] = new RefreshTokenEntry(matricula, expiracao);

    public RefreshTokenEntry? Buscar(string token) =>
        _store.TryGetValue(token, out var entry) ? entry : null;

    public void Revogar(string token) =>
        _store.TryRemove(token, out _);
}
