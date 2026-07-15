namespace Application.DTOs;

/// <summary>
/// DTO de resposta para informações do cliente. Contém dados cadastrais, financeiros e de avaliação de crédito.
/// </summary>
public class ClienteResponse
{
    public int Id { get; set; }
    public string Cnpj { get; set; } = null!;
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
    public decimal CapitalSocial { get; set; }
    public bool RestricaoCadastral { get; set; }
    public EnderecoResponse Endereco { get; set; } = new();
    public string TelefoneComercial { get; set; } = null!;
    public string TelefoneCelular { get; set; } = null!;
    public string EmailPrincipal { get; set; } = null!;
    public string EmailFinanceiro { get; set; } = null!;
    public string Site { get; set; } = null!;
    public decimal TotalParticipacao { get; set; }
    public int FaturamentoQuantidadeMeses { get; set; }
    public string FaturamentoCaracterizacao { get; set; } = null!;
    public decimal FaturamentoValor { get; set; }
    public decimal FaturamentoMedioMensal { get; set; }
    public DateOnly FaturamentoDataAtualizacao { get; set; }
    public string FaturamentoOrigemDados { get; set; } = null!;
    public bool PatrimonioPossui { get; set; }
    public decimal PatrimonioValor { get; set; }
    public string PatrimonioDescricao { get; set; } = null!;
    public DateOnly PatrimonioDataAtualizacao { get; set; }
    public int AvaliacaoCreditoScoreInterno { get; set; }
    public string AvaliacaoCreditoClassificacaoRisco { get; set; } = null!;
    public decimal AvaliacaoCreditoLimiteSugerido { get; set; }
    public string AvaliacaoCreditoObservacao { get; set; } = null!;
    public ICollection<RepresentanteResponse> Representantes { get; set; } = [];
    public ICollection<FaturamentoAnualResponse> FaturamentoAnual { get; set; } = [];
}
