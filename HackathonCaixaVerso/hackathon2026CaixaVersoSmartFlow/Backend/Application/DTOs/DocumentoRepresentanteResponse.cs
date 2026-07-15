namespace Application.DTOs;

/// <summary>
/// DTO de resposta para informações de documentos de representantes. Usado para retornar detalhes dos documentos associados a um representante em uma resposta de API.
/// </summary>
public class DocumentoRepresentanteResponse
{
    public int Id { get; set; }
    public int RepresentanteId { get; set; }
    public string Tipo { get; set; } = null!;
    public string Numero { get; set; } = null!;
    public string OrgaoEmissor { get; set; } = null!;
    public DateOnly DataEmissao { get; set; }
}
