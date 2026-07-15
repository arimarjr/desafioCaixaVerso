namespace Application.DTOs;

/// <summary>
/// DTO de resposta para informações de faturamento anual. Contém detalhes como o ano de referência, valor do faturamento, data de atualização e origem dos dados.
/// </summary>
public class FaturamentoAnualResponse
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public int AnoReferencia { get; set; }
    public string Caracterizacao { get; set; } = null!;
    public decimal Valor { get; set; }
    public DateOnly DataAtualizacao { get; set; }
    public string OrigemDados { get; set; } = null!;
    public decimal Comprovada { get; set; }
}
