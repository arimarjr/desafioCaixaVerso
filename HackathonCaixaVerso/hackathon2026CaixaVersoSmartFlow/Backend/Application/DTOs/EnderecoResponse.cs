namespace Application.DTOs;

/// <summary>
/// DTO de resposta para informações de endereço. Utilizado para retornar dados de endereço em respostas de API.
/// </summary>
public class EnderecoResponse
{
    public string Cep { get; set; } = null!;
    public string Logradouro { get; set; } = null!;
    public string Numero { get; set; } = null!;
    public string Complemento { get; set; } = null!;
    public string Bairro { get; set; } = null!;
    public string Municipio { get; set; } = null!;
    public string Uf { get; set; } = null!;
}
