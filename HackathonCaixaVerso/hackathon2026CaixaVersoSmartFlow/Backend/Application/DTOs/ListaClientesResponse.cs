namespace Application.DTOs;

/// <summary>
/// Response para listagem de clientes com paginação.
/// </summary>
public sealed record ListaClientesResponse(
    int Total,
    int Page,
    int Size,
    IReadOnlyList<ClienteResponse> Items);