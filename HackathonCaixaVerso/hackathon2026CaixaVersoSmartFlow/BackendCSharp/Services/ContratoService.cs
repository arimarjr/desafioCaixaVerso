using System.Security.Cryptography;
using System.Text;
using PlataformaPJ.Application.DTOs;

// =============================================================================
// SERVICE — Geração de Cédula de Crédito Bancário (CCB)
// Hackathon: geração in-memory, sem persistência de arquivo PDF.
// =============================================================================

sealed class ContratoService : IContratoService
{
    private readonly ILogger<ContratoService> _logger;

    public ContratoService(ILogger<ContratoService> logger)
    {
        _logger = logger;
    }

    public GerarContratoResponse GerarContrato(GerarContratoRequest request)
    {
        // Gera ID único para a CCB
        var contratoId = $"CCB-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";

        // Gera hash SHA-256 do conteúdo da CCB (simulado)
        var conteudoParaHash = $"{contratoId}|{request.Cnpj}|{request.ValorSolicitado:F2}|{request.PrazoMeses}|{request.TaxaMensal:F4}";
        var hashDocumento = ComputarHash(conteudoParaHash);

        var nomeArquivo = $"{contratoId}.{request.Formato.ToLower()}";

        _logger.LogInformation(
            "CCB gerada — ID: {ContratoId}, CNPJ: {Cnpj}, Valor: {Valor}",
            contratoId, request.Cnpj, request.ValorSolicitado);

        return new GerarContratoResponse
        {
            ContratoId    = contratoId,
            SimulacaoId   = request.SimulacaoId,
            NomeArquivo   = nomeArquivo,
            Formato       = request.Formato,
            Status        = "GERADO",
            HashDocumento = hashDocumento,
            DataGeracao   = DateTime.UtcNow.ToString("o"), // ISO 8601
        };
    }

    private static string ComputarHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLower();
    }
}
