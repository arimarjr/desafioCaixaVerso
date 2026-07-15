using System.Globalization;
using System.Text.Json;
using Microsoft.AspNetCore.RateLimiting;

// =============================================================================
// ENDPOINTS — Empresas (/empresas/*)
// =============================================================================

static class EmpresasEndpoints
{
    internal static WebApplication MapEmpresasEndpoints(this WebApplication app)
    {
        // GET /empresas/{cnpj} — busca empresa pelo CNPJ e persiste a avaliação
        app.MapGet("/empresas/{cnpj}", (string cnpj, IEmpresasService empresasService, IAvaliacaoService avaliacaoService) =>
        {
            // Sanitiza e valida o CNPJ — aceita formatado (00.000.000/0000-00) ou só dígitos
            var cnpjLimpo = cnpj
                .Replace(".", "")
                .Replace("/", "")
                .Replace("-", "")
                .Replace(" ", "")
                .Trim();

            if (cnpjLimpo.Length != 14 || !cnpjLimpo.All(char.IsAsciiDigit))
                return Results.BadRequest(new { Mensagem = "CNPJ inválido. Informe os 14 dígitos numéricos." });

            var empresa = empresasService.BuscarPorCnpj(cnpjLimpo);
            if (!empresa.HasValue)
                return Results.NotFound(new { Mensagem = $"CNPJ {cnpjLimpo} não encontrado." });

            _registrarAvaliacao(empresa.Value, avaliacaoService);

            return Results.Ok(empresa.Value);
        })
        .RequireAuthorization()
        .RequireRateLimiting("api")
        .WithName("BuscarEmpresaPorCnpj")
        .Produces<JsonElement>()
        .ProducesProblem(400)
        .ProducesProblem(404)
        .WithTags("Empresas");

        return app;
    }

    // ── Salva a avaliação simulada como efeito colateral da busca ─────────────
    private static void _registrarAvaliacao(JsonElement emp, IAvaliacaoService svc)
    {
        try
        {
            var ce   = emp.GetProperty("cadastroEmpresa");
            var aval = emp.GetProperty("avaliacaoCreditoMock");
            var ptBr = new CultureInfo("pt-BR");

            // Tempo de relacionamento
            var diffAnos = 0.0;
            if (ce.TryGetProperty("dataConstituicao", out var dcEl) &&
                DateTime.TryParse(dcEl.GetString(), out var dtAbertura))
                diffAnos = (DateTime.UtcNow - dtAbertura).TotalDays / 365.25;

            // Limite global
            var limiteGlobal = aval.TryGetProperty("limiteSugerido", out var lsEl)
                ? lsEl.GetDecimal() : 0m;

            // Faturamento anual
            decimal faturamento = 0;
            if (emp.TryGetProperty("faturamentoFiscalPatrimonio", out var fat))
            {
                if (fat.TryGetProperty("faturamentoUltimosDozeMeses", out var f12) &&
                    f12.TryGetProperty("valor", out var fv))
                    faturamento = fv.GetDecimal();
                else if (fat.TryGetProperty("faturamentoAnual", out var fa) &&
                    fa.GetArrayLength() > 0 &&
                    fa[0].TryGetProperty("valor", out var fav))
                    faturamento = fav.GetDecimal();
            }

            svc.Salvar(new SalvarAvaliacaoRequest(
                Cnpj:               ce.TryGetProperty("cnpj",                  out var e1) ? e1.GetString() ?? "" : "",
                RazaoSocial:        ce.TryGetProperty("razaoSocial",            out var e2) ? e2.GetString() ?? "" : "",
                NomeFantasia:       ce.TryGetProperty("nomeFantasia",           out var e3) ? e3.GetString() ?? "" : "",
                Segmento:           "EF",
                PorteCaixa:         "PEQUENA",
                PorteEmpresa:       "Pequena Empresa",
                RatingBadge:        "A",
                RatingAprovado:     true,
                LimiteGlobal:       limiteGlobal.ToString("C", ptBr),
                FaturamentoAnual:   faturamento.ToString("C", ptBr),
                Nepj:               "NePJ 1",
                NepjClassificacao:  "Muito Alto",
                TempoRelacionamento: $"{diffAnos:F1} anos",
                PossuiRestricao:    ce.TryGetProperty("restricaoCadastral", out var e5) && e5.GetBoolean()
            ));
        }
        catch
        {
            // Não bloqueia a resposta em caso de falha na persistência
        }
    }
}

