using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("contratos")]
public class ContratosController(ContratoService contratoService) : ControllerBase
{
    private readonly ContratoService _contratoService = contratoService;

    [HttpPost("gerar")]
    [Authorize()]
    [IgnoreAntiforgeryToken()]
    [Produces<GerarContratoResponse>()]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Tags("Contratos")]
    public async Task<ActionResult<GerarContratoResponse>> GerarAsync(
        GerarContratoRequest request,
        CancellationToken ct = default)
    {
        // Validação básica
        if (string.IsNullOrWhiteSpace(request.Cnpj))
            return BadRequest(new { erro = "CNPJ é obrigatório." });

        if (request.ValorSolicitado <= 0)
            return BadRequest(new { erro = "Valor solicitado deve ser maior que zero." });

        if (request.PrazoMeses <= 0)
            return BadRequest(new { erro = "Prazo deve ser maior que zero." });

        var resposta = _contratoService.GerarContrato(request);
        return Ok(resposta);
    }

    [HttpGet("simulacoes/{simulacaoId}/pdf")]
    [Authorize()]
    [IgnoreAntiforgeryToken()]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Tags("Contratos")]
    public ActionResult BaixarPdfAsync(string simulacaoId)
    {
        if (string.IsNullOrWhiteSpace(simulacaoId))
            return BadRequest(new { erro = "Simulação inválida." });

        var conteudo = System.Text.Encoding.UTF8.GetBytes(
            $"Contrato de simulação {simulacaoId} gerado em {DateTime.UtcNow:O}");

        return File(conteudo, "application/pdf", $"contrato-{simulacaoId}.pdf");
    }
}
