using Application.Services;
using Domain.Entities;
using Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

/// <summary>
/// Controlador de avaliações. Todas as rotas requerem autenticação via JWT.
/// </summary>
[ApiController]
[Route("avaliacoes")]
public sealed class AvaliacaoController(AvaliacaoService avaliacaoService, ClienteService clienteService) : ControllerBase
{
    private readonly AvaliacaoService _avaliacaoService = avaliacaoService;
    private readonly ClienteService _clienteService = clienteService;

    public sealed class AvaliarEmpresaRequest
    {
        public string Cnpj { get; set; } = string.Empty;
    }

    public sealed class ResultadoAvaliacaoResponse
    {
        public string Resultado { get; set; } = string.Empty;
        public string Justificativa { get; set; } = string.Empty;
        public decimal? LimiteAprovado { get; set; }
        public string ClassificacaoRisco { get; set; } = string.Empty;
        public int ScoreInterno { get; set; }
        public string DataAvaliacao { get; set; } = string.Empty;
    }

    /// <summary>
    /// Obtém uma avaliação por ID.
    /// </summary>
    /// <param name="id">ID da avaliação</param>
    /// <param name="ct">Token de cancelamento</param>
    [HttpGet("{id}")]
    [Authorize]
    [Tags("Avaliacoes")]
    [EndpointSummary("Obter avaliação por ID")]
    [ProducesResponseType(typeof(Avaliacao), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Avaliacao>> ObterPorIdAsync(string id, CancellationToken ct = default)
    {
        var result = await _avaliacaoService.ObterPorIdAsync(id, ct);
        if (result.IsFailure)
        {
            if (result.Error.Code == "avaliacao.id-invalido")
                return BadRequest(new { code = result.Error.Code, message = result.Error.Message });

            return NotFound(new { code = result.Error.Code, message = result.Error.Message });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Lista avaliações por cliente.
    /// </summary>
    /// <param name="clienteId">ID do cliente</param>
    /// <param name="ct">Token de cancelamento</param>
    [HttpGet("cliente/{clienteId:int}")]
    [Authorize]
    [Tags("Avaliacoes")]
    [EndpointSummary("Listar avaliações por cliente")]
    [ProducesResponseType(typeof(IReadOnlyList<Avaliacao>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<Avaliacao>>> ListarPorClienteIdAsync(int clienteId, CancellationToken ct = default)
    {
        var result = await _avaliacaoService.ListarPorClienteIdAsync(clienteId, ct);
        return Ok(result);
    }

    /// <summary>
    /// Lista avaliações (compatibilidade com frontend Angular).
    /// </summary>
    /// <param name="ct">Token de cancelamento</param>
    [HttpGet]
    [Authorize]
    [Tags("Avaliacoes")]
    [EndpointSummary("Listar avaliações")]
    [ProducesResponseType(typeof(IReadOnlyList<Avaliacao>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<Avaliacao>>> ListarAsync(CancellationToken ct = default)
    {
        var result = await _avaliacaoService.ListarAsync(ct);
        return Ok(result);
    }

    /// <summary>
    /// Cria uma nova avaliação.
    /// </summary>
    /// <param name="avaliacao">Payload da avaliação</param>
    /// <param name="ct">Token de cancelamento</param>
    [HttpPost]
    [Authorize]
    [Tags("Avaliacoes")]
    [EndpointSummary("Criar avaliação")]
    [ProducesResponseType(typeof(Avaliacao), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Avaliacao>> CriarAsync([FromBody] Avaliacao avaliacao, CancellationToken ct = default)
    {
        var result = await _avaliacaoService.CriarAsync(avaliacao, ct);
        if (result.IsFailure)
            return BadRequest(new { code = result.Error.Code, message = result.Error.Message });

        return CreatedAtAction(nameof(ObterPorIdAsync), new { id = result.Value.Id }, result.Value);
    }

    /// <summary>
    /// Avalia empresa por CNPJ (compatibilidade com frontend Angular).
    /// </summary>
    /// <param name="request">Payload da avaliação</param>
    /// <param name="ct">Token de cancelamento</param>
    [HttpPost("avaliar")]
    [Authorize]
    [Tags("Avaliacoes")]
    [EndpointSummary("Avaliar empresa por CNPJ")]
    [ProducesResponseType(typeof(ResultadoAvaliacaoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ResultadoAvaliacaoResponse>> AvaliarAsync(
        [FromBody] AvaliarEmpresaRequest request,
        CancellationToken ct = default)
    {
        var cnpjResult = Cnpj.Create(request.Cnpj);
        if (cnpjResult.IsFailure)
            return BadRequest(new { code = cnpjResult.Error.Code, message = cnpjResult.Error.Message });

        var clienteResult = await _clienteService.ObterClientePorCnpjAsync(cnpjResult.Value, ct);
        if (clienteResult.IsFailure)
            return NotFound(new { code = clienteResult.Error.Code, message = clienteResult.Error.Message });

        var cliente = clienteResult.Value;
        var aprovado = cliente.AvaliacaoCreditoScoreInterno >= 600;

        return Ok(new ResultadoAvaliacaoResponse
        {
            Resultado = aprovado ? "APROVADO" : "REPROVADO",
            Justificativa = cliente.AvaliacaoCreditoObservacao,
            LimiteAprovado = aprovado ? cliente.AvaliacaoCreditoLimiteSugerido : null,
            ClassificacaoRisco = cliente.AvaliacaoCreditoClassificacaoRisco,
            ScoreInterno = cliente.AvaliacaoCreditoScoreInterno,
            DataAvaliacao = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
        });
    }
}
