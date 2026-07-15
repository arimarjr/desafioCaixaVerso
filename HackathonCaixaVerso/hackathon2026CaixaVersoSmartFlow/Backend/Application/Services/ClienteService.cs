using Application.DTOs;
using Application.Mappers;
using Domain.Interfaces;
using Domain.ValueObjects;
using Infra.Abstractions;

namespace Application.Services;

/// <summary>
/// Serviço de Cliente. Responsável por toda a lógica de negócio relacionada aos clientes, incluindo validação, consulta e listagem. Este serviço atua como uma camada intermediária entre os controladores e os repositórios, garantindo que as regras de negócio sejam aplicadas corretamente antes de acessar os dados. Ele também é responsável por retornar resultados padronizados usando o tipo Result, facilitando o tratamento de erros e a comunicação clara com os controladores.
/// </summary>
/// <param name="clienteRepository">Repositório de clientes.</param>
public sealed class ClienteService(IClienteRepository clienteRepository)
{
    private readonly IClienteRepository _clienteRepository = clienteRepository;

    /// <summary>
    /// Obtém detalhes de um cliente específico por ID
    /// </summary>
    /// <param name="id">ID do cliente</param>
    /// <param name="ct">Token de cancelamento (opcional)</param>
    /// <returns>Resultado da operação contendo o cliente ou erro</returns>
    public async Task<Result<ClienteResponse>> ObterClientePorIdAsync(int id, CancellationToken ct)
    {
        var cliente = await _clienteRepository.GetByIdAsync(id, ct);
        if (cliente is null)
            return Error.NotFound("cliente.nao-encontrado", "Cliente não encontrado.");

        return cliente.ToResponse();
    }

    /// <summary>
    /// Obtém detalhes de um cliente específico por CNPJ
    /// </summary>
    /// <param name="cnpj">CNPJ do cliente</param>
    /// <param name="ct">Token de cancelamento (opcional)</param>
    /// <returns>Resultado da operação contendo o cliente ou erro</returns>
    public async Task<Result<ClienteResponse>> ObterClientePorCnpjAsync(Cnpj cnpj, CancellationToken ct)
    {
        var cliente = await _clienteRepository.GetByCnpjAsync(cnpj, ct);
        if (cliente is null)
            return Error.NotFound("cliente.nao-encontrado", "Cliente não encontrado.");

        return cliente.ToResponse();
    }

    /// <summary>
    /// Lista clientes com paginação e filtros opcionais por nome e CNPJ
    /// </summary>
    /// <param name="nome">Filtro por nome (opcional)</param>
    /// <param name="cnpj">Filtro por CNPJ (opcional)</param>
    /// <param name="page">Número da página (padrão: 1)</param>
    /// <param name="size">Tamanho da página (padrão: 20, máximo: 100)</param>
    /// <param name="ct">Token de cancelamento (opcional)</param>
    /// <returns>Resultado da operação contendo a lista de clientes ou erro</returns>
    public async Task<ListaClientesResponse> ListarClientesAsync(
        string? nome,
        Cnpj? cnpj,
        int page,
        int size,
        CancellationToken ct)
    {
        // Normaliza paginação
        if (page < 1)
            page = 1;

        if (size < 1 || size > 100)
            size = 20;

        var (items, total) = await _clienteRepository.ListAsync(nome, cnpj, page, size, ct);

        return new ListaClientesResponse(
            Total: total,
            Page: page,
            Size: size,
            Items: [.. items.Select(c => c.ToResponse())]);
    }

}