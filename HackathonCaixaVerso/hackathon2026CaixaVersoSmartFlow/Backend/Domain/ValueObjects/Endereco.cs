using Infra.Abstractions;

namespace Domain.ValueObjects;

public readonly record struct Endereco(string Cep, string Logradouro, string Numero, string Complemento, string Bairro, string Municipio, string Uf)
{
    public static Result<Endereco> Create(string? cep, string? logradouro, string? numero, string? complemento, string? bairro, string? municipio, string? uf)
    {
        if (string.IsNullOrWhiteSpace(cep) || cep.Replace("-", "").Replace(".", "").Length != 8)
        {
            return Error.Validation("endereco.cep", "CEP deve ter 8 dígitos.");
        }
        if (string.IsNullOrWhiteSpace(logradouro))
        {
            return Error.Validation("endereco.logradouro", "Logradouro é obrigatório.");
        }
        if (string.IsNullOrWhiteSpace(numero))
        {
            return Error.Validation("endereco.numero", "Número é obrigatório.");
        }
        if (string.IsNullOrWhiteSpace(complemento))
        {
            complemento = string.Empty; // Complemento é opcional, pode ser vazio
        }
        if (string.IsNullOrWhiteSpace(bairro))
        {
            return Error.Validation("endereco.bairro", "Bairro é obrigatório.");
        }
        if (string.IsNullOrWhiteSpace(municipio))
        {
            return Error.Validation("endereco.municipio", "Município é obrigatório.");
        }
        if (string.IsNullOrWhiteSpace(uf) || uf.Length != 2)
        {
            return Error.Validation("endereco.uf", "UF deve ter 2 letras.");
        }
        return new Endereco(cep.Replace("-", "").Replace(".", ""), logradouro, numero, complemento, bairro, municipio, uf.ToUpperInvariant());
    }
}
