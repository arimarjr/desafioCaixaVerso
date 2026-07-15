using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("pesquisas-documentos")]
public class PesquisasDocumentosController(PesquisasDocumentosService pesquisasDocumentosService) : ControllerBase
{
    private readonly PesquisasDocumentosService _pesquisasDocumentosService = pesquisasDocumentosService;

    [HttpPost("upload")]
    [Authorize()]
    [IgnoreAntiforgeryToken()]
    [Produces<UploadPesquisaDocumentoResponse>()]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Tags("PesquisasDocumentos")]
    public async Task<ActionResult<UploadPesquisaDocumentoResponse>> UploadAsync(
        HttpRequest request,
        CancellationToken ct = default)
    {
        if (!request.HasFormContentType)
            return BadRequest(new { sucesso = false, mensagem = "Requisição deve ser multipart/form-data." });

        var form = await request.ReadFormAsync(ct);

        var identificadorEmpresa = form["identificadorEmpresa"].ToString();
        var pesquisaId           = form["pesquisaId"].ToString();
        var nomePesquisa         = form["nomePesquisa"].ToString();
        var arquivo              = form.Files.GetFile("arquivo");

        if (arquivo is null)
            return BadRequest(new { sucesso = false, mensagem = "Arquivo não enviado." });

        try
        {
            var resposta = await _pesquisasDocumentosService.SalvarDocumentoAsync(
                identificadorEmpresa, pesquisaId, nomePesquisa, arquivo, ct);

            return Ok(resposta);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { sucesso = false, mensagem = ex.Message });
        }
        
    }

}
