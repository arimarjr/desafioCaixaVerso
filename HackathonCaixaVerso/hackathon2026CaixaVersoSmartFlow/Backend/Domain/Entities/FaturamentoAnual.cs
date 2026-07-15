using Domain.ValueObjects;

namespace Domain.Entities;

public class FaturamentoAnual
{
    public int Id { get; set; }

    public int ClienteId { get; set; }

    public int AnoReferencia { get; set; }

    public string Caracterizacao { get; set; } = string.Empty;

    public Money Valor { get; set; }

    public DateOnly DataAtualizacao { get; set; }

    public string OrigemDados { get; set; } = string.Empty;

    public Money Comprovada { get; set; }
}
