using System.Text.RegularExpressions;
using Infra.Abstractions;

namespace Domain.ValueObjects;

public readonly partial record struct Telefone
{
    public string Value { get; }

    private Telefone(string value) => Value = value;

    public static Result<Telefone> Create(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return Error.Validation("telefone.empty", "Telefone é obrigatório.");
        }
        var digits = OnlyDigits().Replace(raw, string.Empty);
        if (digits.Length is < 10 or > 11)
        {
            return Error.Validation("telefone.length", "Telefone deve ter 10 ou 11 dígitos (com DDD).");
        }
        return new Telefone(digits);
    }

    public override string ToString() => Value;

    [GeneratedRegex(@"\D")]
    private static partial Regex OnlyDigits();
}
