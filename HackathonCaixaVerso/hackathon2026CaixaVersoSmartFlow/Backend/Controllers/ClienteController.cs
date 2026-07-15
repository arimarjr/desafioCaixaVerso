using Application.DTOs;
using Application.Services;
using Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

/// <summary>
/// Controlador de clientes. Todas as rotas requerem autenticação via JWT.
/// </summary>
/// <param name="clienteService"></param>
[ApiController]
[Route("empresas")]
public class ClienteController(ClienteService clienteService) : ControllerBase
{
    private readonly ClienteService _clienteService = clienteService;

    /// <summary>
    /// Lista clientes com filtros opcionais de nome e CNPJ, e suporte a paginação.
    /// Requer autenticação via JWT. O token deve ser enviado no header Authorization: Bearer {token}.
    /// </summary>
    /// <param name="nome">Nome do cliente para filtro (opcional)</param>
    /// <param name="cnpj">CNPJ do cliente para filtro (opcional)</param>
    /// <param name="page">Número da página para paginação (opcional, padrão: 1)</param>
    /// <param name="size">Tamanho da página para paginação (opcional, padrão: 20)</param>
    /// <param name="ct">Token de cancelamento (opcional)</param>
    /// <returns>Lista paginada de clientes</returns>
    [HttpGet()]
    [Authorize()]
    [Tags("empresas")]
    [EndpointSummary("Obter lista paginada de empresas")]
    [ProducesResponseType(typeof(ListaClientesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ListaClientesResponse>> ListarAsync(
        [FromQuery] string? nome,
        [FromQuery] string? cnpj,
        [FromQuery] int page = 1,
        [FromQuery] int size = 20,
        CancellationToken ct = default)
    {
        Cnpj? cnpjFiltro = null;
        if (!string.IsNullOrWhiteSpace(cnpj))
        {
            var cnpjResult = Cnpj.Create(cnpj);
            if (cnpjResult.IsFailure)
                return BadRequest(new { code = cnpjResult.Error.Code, message = cnpjResult.Error.Message });

            cnpjFiltro = cnpjResult.Value;
        }

        var response = await _clienteService.ListarClientesAsync(nome, cnpjFiltro, page, size, ct);
        return Ok(response);
    }

    /// <summary>
    /// Obtém detalhes de um cliente específico por ID. Requer autenticação via JWT.
     /// O token deve ser enviado no header Authorization: Bearer {token}.
     /// Retorna 404 se o cliente não for encontrado, ou 401/403 se a autenticação falhar ou o usuário não tiver permissão. 
     /// Em caso de sucesso, retorna os detalhes do cliente. 
     /// O endpoint suporta cancelamento via CancellationToken.
     /// Exemplo de resposta de sucesso:
     /// {
     ///   "id": 123,
     ///   "nome": "Cliente Exemplo",
     ///   "cnpj": "12.345.678/0001-90",
     ///   "endereco": "Rua Exemplo, 123, Cidade, Estado",
     ///   "telefone": "(11) 98765-4321",
     ///   "email": "cliente@exemplo.com"
     /// }
    /// </summary>
    /// <param name="id">ID do cliente</param>
    /// <param name="ct">Token de cancelamento (opcional)</param>
    /// <returns>Detalhes do cliente</returns>
    [HttpGet("{id:int}")]
    [Authorize()]
    [Tags("empresas")]
    [EndpointSummary("Obter empresa por ID")]
    [ProducesResponseType(typeof(ClienteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ClienteResponse>> ObterPorIdAsync(int id, CancellationToken ct = default)
    {
        var result = await _clienteService.ObterClientePorIdAsync(id, ct);
        if (result.IsFailure)
            return NotFound(new { code = result.Error.Code, message = result.Error.Message });

        return Ok(result.Value);
    }

    /// <summary>
    /// Obtém detalhes de um cliente específico por CNPJ. Requer autenticação via JWT.
     /// O token deve ser enviado no header Authorization: Bearer {token}.
     /// Retorna 404 se o cliente não for encontrado, ou 401/403 se a autenticação falhar ou o usuário não tiver permissão. 
     /// Em caso de sucesso, retorna os detalhes do cliente. 
     /// O endpoint suporta cancelamento via CancellationToken.
     /// Exemplo de resposta de sucesso:
     /// {
     ///   "id": 123,
     ///   "nome": "Cliente Exemplo",
     ///   "cnpj": "12.345.678/0001-90",
     ///   "endereco": "Rua Exemplo, 123, Cidade, Estado",
     ///   "telefone": "(11) 98765-4321",
     ///   "email": "cliente@exemplo.com"
     /// }
    /// </summary>
    /// <param name="cnpj">CNPJ do cliente</param>
    /// <param name="ct">Token de cancelamento (opcional)</param>
    /// <returns>Detalhes do cliente</returns>
    [HttpGet("{cnpj:cnpj}")]
    [Authorize()]
    [Tags("empresas")]
    [EndpointSummary("Obter empresa por CNPJ")]
    [EndpointName("BuscarEmpresaPorCnpj")]
    [ProducesResponseType(typeof(ClienteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClienteResponse>> ObterPorCnpjAsync(string cnpj, CancellationToken ct = default)
    {
        var cnpjResult = Cnpj.Create(cnpj);
        if (cnpjResult.IsFailure)
            return BadRequest(new { code = cnpjResult.Error.Code, message = cnpjResult.Error.Message });

        var result = await _clienteService.ObterClientePorCnpjAsync(cnpjResult.Value, ct);
        if (result.IsFailure)
            return NotFound(new { code = result.Error.Code, message = result.Error.Message });

        return Ok(result.Value);
    }
}

