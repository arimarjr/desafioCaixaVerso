using Domain.ValueObjects;

namespace Domain.Entities;

public class Avaliacao
{
    public string Id { get; set; } = null!;

    public int ClienteId { get; set; }

    public DateTime DataHoraAvaliacao { get; set; }

    public Cnpj Cnpj { get; set; }

    public string RazaoSocial { get; set; } = null!;

    public string NomeFantasia { get; set; } = null!;

    public string Segmento { get; set; } = null!;

    public string PorteCaixa { get; set; } = null!;

    public string PorteEmpresa { get; set; } = null!;

    public string RatingBadge { get; set; } = null!;

    public bool RatingAprovado { get; set; }

    public Money LimiteGlobal { get; set; }

    public Money FaturamentoAnual { get; set; }

    public string Nepj { get; set; } = null!;

    public string NepjClassificacao { get; set; } = null!;

    public string TempoRelacionamento { get; set; } = null!;

    public bool PossuiRestricao { get; set; }
}