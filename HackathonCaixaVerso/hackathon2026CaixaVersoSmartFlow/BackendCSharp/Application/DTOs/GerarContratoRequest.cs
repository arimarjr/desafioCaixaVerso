namespace PlataformaPJ.Application.DTOs;

// =============================================================================
// DTO — Request para geração de CCB
// =============================================================================

public sealed class GerarContratoRequest
{
    public string SimulacaoId       { get; set; } = string.Empty;
    public string Formato           { get; set; } = "PDF";      // "PDF" | "DOCX"
    public string RazaoSocial       { get; set; } = string.Empty;
    public string Cnpj              { get; set; } = string.Empty;
    public string LinhaCredito      { get; set; } = string.Empty;
    public decimal ValorSolicitado  { get; set; }
    public int PrazoMeses           { get; set; }
    public decimal TaxaMensal       { get; set; }
}
