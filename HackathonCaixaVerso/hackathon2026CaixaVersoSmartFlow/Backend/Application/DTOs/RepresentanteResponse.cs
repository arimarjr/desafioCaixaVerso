namespace Application.DTOs;

/// <summary>
/// DTO de resposta para informações de um representante. Inclui detalhes pessoais, função, participação societária e contatos.
/// </summary>
public class RepresentanteResponse
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string Perfil { get; set; } = null!;
    public string Cpf { get; set; } = null!;
    public string Nome { get; set; } = null!;
    public string Funcao { get; set; } = null!;
    public DateOnly DataIngresso { get; set; }
    public decimal PercentualParticipacaoSocietaria { get; set; }
    public string TipoParticipacao { get; set; } = null!;
    public string Telefone { get; set; } = null!;
    public string Celular { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Site { get; set; } = null!;
    public ICollection<DocumentoRepresentanteResponse> Documentos { get; set; } = [];
}
