namespace PlataformaPJ.Application.DTOs;

// =============================================================================
// DTO — Response da geração de CCB
// =============================================================================

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
