using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Application.DTOs;
using Application.Services;
using Configuration;
using Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("ia")]
public class IaController(ClienteService clienteService, AvaliacaoService avaliacaoService) : ControllerBase
{
    private readonly ClienteService _clienteService = clienteService;
    private readonly AvaliacaoService _avaliacaoService = avaliacaoService;

    private string? accessToken = null;
    private DateTime tokenExpiresAt = DateTime.MinValue;

    [HttpGet("chat/{avaliacaoId}")]
    [Authorize()]
    public async Task<ActionResult<ChatResponse>> ChatAsync(
        [FromRoute] string avaliacaoId,
        CancellationToken ct = default)
    {

        var avaliacaoResult = await _avaliacaoService.ObterPorIdAsync(avaliacaoId, ct);
        if (avaliacaoResult.IsFailure)
            return BadRequest(new { code = avaliacaoResult.Error.Code, message = avaliacaoResult.Error.Message });

        // =========================
        // 1. Ler entrada
        // =========================

        // =========================
        // 2. BUSCA NO JSON (array simples)
        // =========================
        var empresaEncontrada = await _clienteService.ObterClientePorIdAsync(avaliacaoResult.Value.ClienteId, ct);
        if (empresaEncontrada.IsFailure)
            return NotFound(new { code = empresaEncontrada.Error.Code, message = empresaEncontrada.Error.Message });

        // =========================
        // 3. EXTRAIR DADOS DA EMPRESA
        // =========================

        var dataHoraAvaliacao = avaliacaoResult.Value.DataHoraAvaliacao;
        var cnpj = empresaEncontrada.Value.Cnpj;
        var razaoSocial = empresaEncontrada.Value.RazaoSocial;
        var nomeFantasia = empresaEncontrada.Value.NomeFantasia;
        var segmento = avaliacaoResult.Value.Segmento;
        var porteCaixa = avaliacaoResult.Value.PorteCaixa;
        var porteEmpresa = avaliacaoResult.Value.PorteEmpresa;
        var ratingBadge = avaliacaoResult.Value.RatingBadge;
        var ratingAprovado = avaliacaoResult.Value.RatingAprovado;
        var limiteGlobal = avaliacaoResult.Value.LimiteGlobal;
        var faturamentoAnual = avaliacaoResult.Value.FaturamentoAnual;
        var nepj = avaliacaoResult.Value.Nepj;
        var nepjClassificacao = avaliacaoResult.Value.NepjClassificacao;
        var tempoRelacionamento = avaliacaoResult.Value.TempoRelacionamento;
        var possuiRestricao = avaliacaoResult.Value.PossuiRestricao;

        var empresaJson = JsonSerializer.Serialize(new
        {
            avaliacaoId,
            dataHoraAvaliacao,
            cnpj,
            razaoSocial,
            nomeFantasia,
            segmento,
            porteCaixa, 
            porteEmpresa,
            ratingBadge,
            ratingAprovado,
            limiteGlobal,
            faturamentoAnual,
            nepj,
            nepjClassificacao,
            tempoRelacionamento,
            possuiRestricao
        });

        Console.WriteLine($"Empresa encontrada: {razaoSocial} - enviando para IA...");

        // =========================
        // 4. Renovar token se necessário
        // =========================
        var apiKey = AppSettings.ServicesConfig.ApiKey;
        var useApiKey = !string.IsNullOrWhiteSpace(apiKey);
        if (!useApiKey)
            await EnsureTokenAsync(ct);

        // =========================
        // 5–10. Chamada à IA e retorno
        // =========================
        return await ChamarIaAsync(empresaJson, ct);
    }

    /// <summary>
    /// Recomenda produtos de crédito diretamente por CNPJ, sem necessidade de avaliação prévia salva.
    /// </summary>
    [HttpGet("recomendar/{cnpj}")]
    [Authorize()]
    public async Task<ActionResult<ChatResponse>> RecomendarPorCnpjAsync(
        [FromRoute] string cnpj,
        CancellationToken ct = default)
    {
        var cnpjResult = Cnpj.Create(cnpj);
        if (cnpjResult.IsFailure)
            return BadRequest(new { code = cnpjResult.Error.Code, message = cnpjResult.Error.Message });

        var clienteResult = await _clienteService.ObterClientePorCnpjAsync(cnpjResult.Value, ct);
        if (clienteResult.IsFailure)
            return NotFound(new { code = clienteResult.Error.Code, message = clienteResult.Error.Message });

        var c = clienteResult.Value;

        var score       = c.AvaliacaoCreditoScoreInterno;
        var aprovado    = score >= 600;
        var limiteGlobal     = c.AvaliacaoCreditoLimiteSugerido;
        var faturamentoAnual = c.FaturamentoMedioMensal * 12;

        var dataAbertura     = c.DataConstituicao.ToDateTime(TimeOnly.MinValue);
        var diffAnos         = (DateTime.UtcNow - dataAbertura).TotalDays / 365.25;

        var empresaJson = JsonSerializer.Serialize(new
        {
            cnpj             = c.Cnpj,
            razaoSocial      = c.RazaoSocial,
            nomeFantasia     = c.NomeFantasia,
            segmento         = c.DescricaoCnaePrincipal,
            porteCaixa       = c.PorteCaixa,
            porteEmpresa     = c.TipoEmpresa,
            ratingBadge      = c.AvaliacaoCreditoClassificacaoRisco,
            ratingAprovado   = aprovado,
            limiteGlobal,
            faturamentoAnual,
            scoreInterno     = score,
            tempoRelacionamento = $"{diffAnos:F1} anos",
            possuiRestricao  = c.RestricaoCadastral,
            observacao       = c.AvaliacaoCreditoObservacao
        });

        Console.WriteLine($"[IA] Recomendação por CNPJ: {c.RazaoSocial}");

        return await ChamarIaAsync(empresaJson, ct);
    }

    private async Task<ActionResult<ChatResponse>> ChamarIaAsync(string empresaJson, CancellationToken ct)
    {
        var apiKey    = AppSettings.ServicesConfig.ApiKey;
        var useApiKey = !string.IsNullOrWhiteSpace(apiKey);
        if (!useApiKey)
            await EnsureTokenAsync(ct);

        var payload = new
        {
            model = "gpt-4.1",
            input = new object[]
            {
                new
                {
                    type = "message",
                    role = "user",
                    content = new object[]
                    {
                        new
                        {
                            type = "input_text",
                            text = $@"Analise os dados da empresa abaixo.

                                    DADOS DA EMPRESA:
                                    {empresaJson}

                                    Com base EXCLUSIVA nos normativos da Caixa disponíveis na sua base,
                                    recomende para esta empresa:

                                    1. Produtos de crédito adequados ao perfil
                                    2. Modalidades disponíveis
                                    3. Garantias exigidas para cada produto

                                    Para cada recomendação:
                                    - Nome do produto
                                    - Modalidade com código, se código estiver disponível nos normativos.
                                    - Garantias obrigatórias
                                    - Referência ao normativo utilizado

                                    Responda de forma estruturada e objetiva.
                                    NÃO repita os dados da empresa na resposta."
                        }
                    }
                }
            },
            agent_reference = new
            {
                type = "agent_reference",
                name = AppSettings.ServicesConfig.Agent,
                version = "13"
            }
        };

        var jsonBody = JsonSerializer.Serialize(payload);

        var handler = new HttpClientHandler
        {
            Proxy = WebRequest.DefaultWebProxy,
            UseProxy = true,
            DefaultProxyCredentials = CredentialCache.DefaultCredentials
        };

        var http = new HttpClient(handler);

        if (useApiKey)
            http.DefaultRequestHeaders.Add("api-key", apiKey);
        else
            http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

        http.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));

        var response = await http.PostAsync(
            "https://foundry-2-insights-code.services.ai.azure.com/api/projects/foundry-2-insights/openai/v1/responses",
            new StringContent(jsonBody, Encoding.UTF8, "application/json"));

        var rawBytes  = await response.Content.ReadAsByteArrayAsync();
        var jsonResp  = Encoding.UTF8.GetString(rawBytes);

        Console.WriteLine("[IA] Resposta bruta:");
        Console.WriteLine(jsonResp);

        if (!response.IsSuccessStatusCode)
            return Problem(jsonResp);

        var respDoc      = JsonDocument.Parse(jsonResp);
        var recomendacao = "Não foi possível extrair recomendação.";
        var output       = respDoc.RootElement.GetProperty("output");

        foreach (var item in output.EnumerateArray())
        {
            if (item.GetProperty("type").GetString() == "message")
            {
                foreach (var c in item.GetProperty("content").EnumerateArray())
                {
                    if (c.GetProperty("type").GetString() == "output_text")
                    {
                        recomendacao = c.GetProperty("text").GetString() ?? recomendacao;
                        break;
                    }
                }
            }
        }

        return Ok(new ChatResponse { Resposta = recomendacao });
    }

    async Task EnsureTokenAsync(CancellationToken ct = default)
    {
        if (accessToken != null && DateTime.UtcNow < tokenExpiresAt)
            return;

        var clientId = Environment.GetEnvironmentVariable("AZURE_CLIENT_ID");
        var tenantId = Environment.GetEnvironmentVariable("AZURE_TENANT_ID");
        var clientSecret = Environment.GetEnvironmentVariable("AZURE_CLIENT_SECRET");
        var scope = "https://ai.azure.com/.default";

        if (string.IsNullOrWhiteSpace(clientId) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            string.IsNullOrWhiteSpace(clientSecret))
        {
            throw new InvalidOperationException(
                "Autenticação da IA não configurada. Defina ServicesConfig:ApiKey no Key Vault " +
                "ou as variáveis AZURE_CLIENT_ID, AZURE_TENANT_ID e AZURE_CLIENT_SECRET.");
        }

        using var tokenResp = await new HttpClient().PostAsync(
            $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["scope"] = scope
            }),
            ct);

        var tokenJson = await tokenResp.Content.ReadAsStringAsync(ct);
        if (!tokenResp.IsSuccessStatusCode)
            throw new InvalidOperationException($"Falha ao obter token AAD: {tokenJson}");

        using var tokenDoc = JsonDocument.Parse(tokenJson);

        accessToken = tokenDoc.RootElement.GetProperty("access_token").GetString();
        var expiresIn = tokenDoc.RootElement.TryGetProperty("expires_in", out var expiresEl)
            ? expiresEl.GetInt32()
            : 3600;
        tokenExpiresAt = DateTime.UtcNow.AddSeconds(Math.Max(60, expiresIn - 60));

    }

}
