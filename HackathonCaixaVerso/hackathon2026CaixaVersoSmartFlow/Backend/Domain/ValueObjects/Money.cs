using Infra.Abstractions;

namespace Domain.ValueObjects;

/// <summary>
/// Money value object: decimal(18,2) BRL only in this scope.
/// Two-cent precision; rounding always banker's rounding (MidpointRounding.ToEven).
/// </summary>
public readonly record struct Money
{
    public const string DefaultCurrency = "BRL";

    public decimal Amount { get; }
    public string Currency { get; }

    public static readonly Money Zero = new(0m, DefaultCurrency);

    private Money(decimal amount, string currency)
    {
        Amount = decimal.Round(amount, 2, MidpointRounding.ToEven);
        Currency = currency;
    }

    public static Result<Money> Create(decimal amount, string currency = DefaultCurrency)
    {
        if (string.IsNullOrWhiteSpace(currency) || currency.Length != 3)
        {
            return Error.Validation("money.currency-invalid", "Currency must be a 3-letter ISO 4217 code.");
        }
        if (currency != DefaultCurrency)
        {
            return Error.Validation("money.currency-unsupported", $"Currency '{currency}' is not supported in this scope (BRL only).");
        }
        return new Money(amount, currency);
    }

    public static Money Brl(decimal amount) => new(amount, DefaultCurrency);

    public Result<Money> Plus(Money other)
    {
        if (Currency != other.Currency)
        {
            return Error.Validation("money.currency-mismatch", "Cannot add money of different currencies.");
        }
        return new Money(Amount + other.Amount, Currency);
    }

    public Result<Money> Minus(Money other)
    {
        if (Currency != other.Currency)
        {
            return Error.Validation("money.currency-mismatch", "Cannot subtract money of different currencies.");
        }
        return new Money(Amount - other.Amount, Currency);
    }

    public bool IsGreaterThanOrEqualTo(Money other)
        => Currency == other.Currency && Amount >= other.Amount;

    public bool IsPositive => Amount > 0m;
    public bool IsNegative => Amount < 0m;
    public bool IsZero => Amount == 0m;

    public override string ToString() => $"{Currency} {Amount:N2}";
}
