namespace Domain.Entities;

public class DocumentoRepresentante
{
    public int Id { get; set; }
    
    public int RepresentanteId { get; set; }

    public string Tipo { get; set; } = null!;

    public string Numero { get; set; } = null!;

    public string OrgaoEmissor { get; set; } = null!;

    public DateOnly DataEmissao { get; set; }
}