using PlataformaPJ.Application.DTOs;

// =============================================================================
// ENDPOINTS — Contratos / CCB
// POST /contratos/gerar   — gera a CCB e retorna os metadados
// =============================================================================

static class ContratosEndpoints
{
    public static IEndpointRouteBuilder MapContratosEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/contratos");

        // ── POST /contratos/gerar ──────────────────────────────────────────────
        group.MapPost("/gerar", (
            GerarContratoRequest request,
            IContratoService contratoService) =>
        {
            // Validação básica
            if (string.IsNullOrWhiteSpace(request.Cnpj))
                return Results.BadRequest(new { erro = "CNPJ é obrigatório." });

            if (request.ValorSolicitado <= 0)
                return Results.BadRequest(new { erro = "Valor solicitado deve ser maior que zero." });

            if (request.PrazoMeses <= 0)
                return Results.BadRequest(new { erro = "Prazo deve ser maior que zero." });

            var resposta = contratoService.GerarContrato(request);
            return Results.Ok(resposta);
        })
        .RequireAuthorization();

        return app;
    }
}
