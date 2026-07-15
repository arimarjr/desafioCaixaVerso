// =============================================================================
// ENDPOINTS — Avaliações de crédito (/avaliacoes/*)
// =============================================================================

static class AvaliacoesEndpoints
{
    internal static WebApplication MapAvaliacoesEndpoints(this WebApplication app)
    {
        // POST /avaliacoes — persiste o resultado de uma avaliação
        app.MapPost("/avaliacoes", (SalvarAvaliacaoRequest req, IAvaliacaoService svc) =>
        {
            var resultado = svc.Salvar(req);
            return Results.Created($"/avaliacoes/{resultado.Id}", resultado);
        })
        .RequireAuthorization()
        .WithName("SalvarAvaliacao")
        .Produces<ResultadoAvaliacao>(StatusCodes.Status201Created)
        .WithTags("Avaliacoes");

        // GET /avaliacoes — lista todas as avaliações salvas (para uso da IA)
        app.MapGet("/avaliacoes", (IAvaliacaoService svc) =>
            Results.Ok(svc.ListarTodas()))
        .RequireAuthorization()
        .WithName("ListarAvaliacoes")
        .Produces<IReadOnlyList<ResultadoAvaliacao>>()
        .WithTags("Avaliacoes");

        return app;
    }
}
