using PlataformaPJ.Models;

// =============================================================================
// ENDPOINTS — Pesquisas / Documentos (/pesquisas-documentos/*)
// =============================================================================

static class PesquisasDocumentosEndpoints
{
    internal static WebApplication MapPesquisasDocumentosEndpoints(this WebApplication app)
    {
        // POST /pesquisas-documentos/upload
        // Recebe: multipart/form-data com arquivo PDF + metadados
        // Salva em: <DiretorioBase>/<identificadorEmpresa>/<timestamp>_<pesquisaId>_<nomePesquisa>.pdf
        app.MapPost("/pesquisas-documentos/upload", async (
            HttpRequest            request,
            IPesquisasDocumentosService service,
            CancellationToken      ct) =>
        {
            if (!request.HasFormContentType)
                return Results.BadRequest(new { sucesso = false, mensagem = "Requisição deve ser multipart/form-data." });

            var form = await request.ReadFormAsync(ct);

            var identificadorEmpresa = form["identificadorEmpresa"].ToString();
            var pesquisaId           = form["pesquisaId"].ToString();
            var nomePesquisa         = form["nomePesquisa"].ToString();
            var arquivo              = form.Files.GetFile("arquivo");

            if (arquivo is null)
                return Results.BadRequest(new { sucesso = false, mensagem = "Arquivo não enviado." });

            try
            {
                var resposta = await service.SalvarDocumentoAsync(
                    identificadorEmpresa, pesquisaId, nomePesquisa, arquivo, ct);

                return Results.Ok(resposta);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
        })
        .RequireAuthorization()
        .DisableAntiforgery()
        .WithName("UploadDocumentoPesquisa")
        .Produces<UploadPesquisaDocumentoResponse>()
        .ProducesProblem(400)
        .WithTags("PesquisasDocumentos");

        return app;
    }
}
