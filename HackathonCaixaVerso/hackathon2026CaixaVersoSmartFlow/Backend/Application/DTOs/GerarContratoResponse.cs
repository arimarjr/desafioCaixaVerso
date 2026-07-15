namespace Application.DTOs;

/// <summary>
/// Resposta da geração de contrato. Contém informações sobre o contrato gerado, como ID, nome do arquivo, formato, status e hash do documento.
/// </summary>
public sealed class GerarContratoResponse
{
    public string ContratoId      { get; set; } = string.Empty;
    public string SimulacaoId     { get; set; } = string.Empty;
    public string NomeArquivo     { get; set; } = string.Empty;
    public string Formato         { get; set; } = string.Empty;
    public string Status          { get; set; } = string.Empty;
    public string HashDocumento   { get; set; } = string.Empty;
    public string DataGeracao     { get; set; } = string.Empty; // ISO 8601
}
