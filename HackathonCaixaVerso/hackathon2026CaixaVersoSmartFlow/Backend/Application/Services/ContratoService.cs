using System.Security.Cryptography;
using System.Text;
using Application.DTOs;

namespace Application.Services;

/// <summary>
/// Serviço de Contrato. Responsável por toda a lógica de negócio relacionada à geração de contratos, incluindo validação de dados, criação de IDs únicos e computação de hashes para garantir a integridade dos documentos gerados. Este serviço atua como uma camada intermediária entre os controladores e os repositórios (se necessário), garantindo que as regras de negócio sejam aplicadas corretamente antes de acessar os dados ou gerar os contratos. Ele também é responsável por retornar resultados padronizados usando o tipo Result, facilitando o tratamento de erros e a comunicação clara com os controladores.
/// </summary>
/// <param name="logger"></param>
public sealed class ContratoService(
    ILogger<ContratoService> logger)
{
    private readonly ILogger<ContratoService> _logger = logger;

    /// <summary>
    /// 
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
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

    /// <summary>
    /// 
    /// </summary>
    /// <param name="input"></param>
    /// <returns></returns>
    private static string ComputarHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLower();
    }
}
