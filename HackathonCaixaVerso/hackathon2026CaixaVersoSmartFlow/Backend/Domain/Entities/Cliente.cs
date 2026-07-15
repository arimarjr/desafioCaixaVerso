using Domain.ValueObjects;

namespace Domain.Entities;

public class Cliente
{
    public int Id { get; set; }

    public Cnpj Cnpj { get; set; } = new();

    public string RazaoSocial { get; set; } = null!;

    public string NomeFantasia { get; set; } = null!;

    public string CnaePrincipal { get; set; } = null!;

    public string DescricaoCnaePrincipal { get; set; } = null!;

    public string NaturezaJuridica { get; set; } = null!;

    public string PorteCaixa { get; set; } = null!;

    public string RegimeTributario { get; set; } = null!;

    public DateOnly DataConstituicao { get; set; }

    public string TipoEmpresa { get; set; } = null!;

    public DateOnly DataDemonstracaoContabil { get; set; }

    public string DocumentoConstitutivo { get; set; } = null!;

    public DateOnly DataUltimaAlteracao { get; set; }

    public Money CapitalSocial { get; set; }

    public bool RestricaoCadastral { get; set; }

    public Endereco Endereco { get; set; } = new();

    public Telefone TelefoneComercial { get; set; } = new();

    public Telefone TelefoneCelular { get; set; } = new();

    public Email EmailPrincipal { get; set; } = new();

    public Email EmailFinanceiro { get; set; } = new();

    public string Site { get; set; } = null!;

    public decimal TotalParticipacao { get; set; }

    public int FaturamentoQuantidadeMeses { get; set; }

    public string FaturamentoCaracterizacao { get; set; } = null!;

    public Money FaturamentoValor { get; set; }

    public Money FaturamentoMedioMensal { get; set; }

    public DateOnly FaturamentoDataAtualizacao { get; set; }

    public string FaturamentoOrigemDados { get; set; } = null!;

    public bool PatrimonioPossui { get; set; }

    public Money PatrimonioValor { get; set; }

    public string PatrimonioDescricao { get; set; } = null!;

    public DateOnly PatrimonioDataAtualizacao { get; set; }

    public int AvaliacaoCreditoScoreInterno { get; set; }

    public string AvaliacaoCreditoClassificacaoRisco { get; set; } = null!;

    public Money AvaliacaoCreditoLimiteSugerido { get; set; }

    public string AvaliacaoCreditoObservacao { get; set; } = null!;

    public virtual ICollection<Representante> Representantes { get; set; } = [];

    public virtual ICollection<FaturamentoAnual> FaturamentoAnual { get; set; } = [];
    public virtual ICollection<Avaliacao> Avaliacao { get; set; } = [];

}