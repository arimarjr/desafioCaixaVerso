using System.Text.RegularExpressions;
using Infra.Abstractions;

namespace Domain.ValueObjects;

public readonly partial record struct Email
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Result<Email> Create(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return Error.Validation("email.empty", "E-mail é obrigatório.");
        }

        var trimmed = raw.Trim().ToLowerInvariant();
        if (trimmed.Length > 254 || !Pattern().IsMatch(trimmed))
        {
            return Error.Validation("email.format", "E-mail em formato inválido.");
        }

        return new Email(trimmed);
    }

    public override string ToString() => Value;

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex Pattern();
}
