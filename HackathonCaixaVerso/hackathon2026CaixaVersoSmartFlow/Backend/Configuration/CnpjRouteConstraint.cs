using Domain.ValueObjects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Configuration;

public sealed class CnpjRouteConstraint : IRouteConstraint
{
    public bool Match(
        HttpContext? httpContext,
        IRouter? route,
        string routeKey,
        RouteValueDictionary values,
        RouteDirection routeDirection)
    {
        if (!values.TryGetValue(routeKey, out var rawValue) || rawValue is null)
        {
            return false;
        }

        var cnpjRaw = rawValue.ToString();
        return !string.IsNullOrWhiteSpace(cnpjRaw) && Cnpj.Create(cnpjRaw).IsSuccess;
    }
}