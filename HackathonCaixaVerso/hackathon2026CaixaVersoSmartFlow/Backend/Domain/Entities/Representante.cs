using Domain.ValueObjects;

namespace Domain.Entities;
public class Representante
{
    public int Id { get; set; }
    public int ClienteId { get; set; }

    public string Perfil { get; set; } = string.Empty;

    public string Cpf { get; set; } = string.Empty;

    public string Nome { get; set; } = string.Empty;

    public string Funcao { get; set; } = string.Empty;

    public DateOnly DataIngresso { get; set; }

    public decimal PercentualParticipacaoSocietaria { get; set; }

    public string TipoParticipacao { get; set; } = string.Empty;

    public Telefone Telefone { get; set; } = new();

    public Telefone Celular { get; set; } = new();

    public Email Email { get; set; } = new();

    public string Site { get; set; } = null!;

     public virtual ICollection<DocumentoRepresentante> Documentos { get; set; } = [];

}
