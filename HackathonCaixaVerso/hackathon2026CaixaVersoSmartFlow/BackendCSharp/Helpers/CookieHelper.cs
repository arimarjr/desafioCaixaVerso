// =============================================================================
// HELPER — Opções de cookie seguro por ambiente
// =============================================================================

static class CookieHelper
{
    internal static CookieOptions OpcoesRefreshToken(IWebHostEnvironment env) => new()
    {
        HttpOnly = true,
        Secure   = !env.IsDevelopment(),                            // HTTPS obrigatório em prod
        SameSite = env.IsDevelopment() ? SameSiteMode.Lax          // Lax permite cross-origin em dev
                                       : SameSiteMode.Strict,       // Strict bloqueia cross-site em prod
        Expires  = DateTimeOffset.UtcNow.AddDays(7),
        Path     = "/",  // "/" necessário ao usar proxy Angular (/api/*→/*); HttpOnly já protege contra XSS
    };
}
