using Domain.Entities;
using Domain.Interfaces;
using Infra.Abstractions;

namespace Application.Services;

/// <summary>
/// Serviço de Avaliação. Responsável por toda a lógica de negócio relacionada às avaliações, incluindo validação, criação e consulta. Este serviço atua como uma camada intermediária entre os controladores e os repositórios, garantindo que as regras de negócio sejam aplicadas corretamente antes de acessar os dados. Ele também é responsável por retornar resultados padronizados usando o tipo Result, facilitando o tratamento de erros e a comunicação clara com os controladores.
/// </summary>
/// <param name="avaliacaoRepository">Repositório de avaliações.</param>
public sealed class AvaliacaoService(IAvaliacaoRepository avaliacaoRepository)
{
    private readonly IAvaliacaoRepository _avaliacaoRepository = avaliacaoRepository;

    /// <summary>
    /// Obtém uma avaliação por ID. Valida o ID fornecido e retorna um resultado padronizado indicando sucesso ou falha, com mensagens de erro claras para casos de ID inválido ou avaliação não encontrada.
    /// </summary>
    /// <param name="id">ID da avaliação.</param>
    /// <param name="ct">Token de cancelamento.</param>
    /// <returns>Resultado da operação contendo a avaliação ou erro.</returns>
    public async Task<Result<Avaliacao>> ObterPorIdAsync(string id, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(id))
            return Error.Validation("avaliacao.id-invalido", "Id da avaliação é obrigatório.");

        var avaliacao = await _avaliacaoRepository.GetByIdAsync(id, ct);
        if (avaliacao is null)
            return Error.NotFound("avaliacao.nao-encontrada", "Avaliação não encontrada.");

        return avaliacao;
    }

    /// <summary>
    /// Lista avaliações por cliente. Retorna todas as avaliações associadas a um cliente específico, ordenadas por data de avaliação em ordem decrescente. O resultado é uma lista de avaliações ou um resultado de erro padronizado em caso de falha.
    /// </summary>
    /// <param name="clienteId">ID do cliente.</param>
    /// <param name="ct">Token de cancelamento.</param>
    /// <returns>Resultado da operação contendo a lista de avaliações ou erro.</returns>
    public Task<IReadOnlyList<Avaliacao>> ListarPorClienteIdAsync(int clienteId, CancellationToken ct)
        => _avaliacaoRepository.ListByClienteIdAsync(clienteId, ct);

    /// <summary>
    /// Lista todas as avaliações ordenadas da mais recente para a mais antiga.
    /// </summary>
    /// <param name="ct">Token de cancelamento.</param>
    /// <returns>Lista de avaliações.</returns>
    public Task<IReadOnlyList<Avaliacao>> ListarAsync(CancellationToken ct)
        => _avaliacaoRepository.ListAsync(ct);

    /// <summary>
    /// Cria uma nova avaliação. Valida a avaliação fornecida, garantindo que os campos obrigatórios estejam presentes e preenchidos corretamente. Se a avaliação for válida, ela é adicionada ao repositório e salva. O resultado é a avaliação criada ou um resultado de erro padronizado em caso de falha.
    /// </summary>
    /// <param name="avaliacao">Avaliação a ser criada.</param>
    /// <param name="ct">Token de cancelamento.</param>
    /// <returns>Resultado da operação contendo a avaliação criada ou erro.</returns>
    public async Task<Result<Avaliacao>> CriarAsync(Avaliacao avaliacao, CancellationToken ct)
    {
        if (avaliacao is null)
            return Error.Validation("avaliacao.invalida", "Avaliação é obrigatória.");

        if (string.IsNullOrWhiteSpace(avaliacao.Id))
            avaliacao.Id = Guid.NewGuid().ToString("N");

        if (avaliacao.DataHoraAvaliacao == default)
            avaliacao.DataHoraAvaliacao = DateTime.UtcNow;

        await _avaliacaoRepository.AddAsync(avaliacao, ct);
        await _avaliacaoRepository.SaveAsync(ct);

        return avaliacao;
    }
}