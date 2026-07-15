using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

namespace Infra.Auth;

public sealed record JwtClientOptions(string Issuer, string Audience, string Secret, TimeSpan TokenLifetime)
{
    public const string ConfigSection = "Jwt";
    public const string DefaultIssuer = "smartflowpj";
    public const string DefaultAudience = "smartflowpj-clients";

    public static JwtClientOptions FromConfiguration(IConfiguration config)
    {
        var section = config.GetSection(ConfigSection);
        var secret = section["Secret"]
                     ?? Environment.GetEnvironmentVariable("SMARTFLOWPJ_JWT_SECRET")
                     ?? "dev-secret-change-me-this-must-be-at-least-32-chars";
        return new JwtClientOptions(
            section["Issuer"] ?? DefaultIssuer,
            section["Audience"] ?? DefaultAudience,
            secret,
            TimeSpan.FromMinutes(int.TryParse(section["TokenLifetimeMinutes"], out var m) ? m : 60));
    }
}

public static class JwtClientAuthExtensions
{
    private const string RefreshCookieName = "smartflowpj_refresh_token";

    public static IServiceCollection AddSmartFlowPjJwtAuth(this IServiceCollection services, IConfiguration config)
    {
        var opts = JwtClientOptions.FromConfiguration(config);
        services.AddSingleton(opts);
        services.AddSingleton<JwtTokenIssuer>();

        services.AddAuthentication(options => {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(jwt => {
            jwt.TokenValidationParameters = new TokenValidationParameters {
                ValidateIssuer = true,
                ValidIssuer = opts.Issuer,
                ValidateAudience = true,
                ValidAudience = opts.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.Secret)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            };
        });
        services.AddAuthorization();

        services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter("login", opt =>
            {
                opt.PermitLimit            = 5;
                opt.Window                 = TimeSpan.FromMinutes(1);
                opt.QueueProcessingOrder   = QueueProcessingOrder.OldestFirst;
                opt.QueueLimit             = 0;
            });
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        });

        return services;
    }

    /// <summary>
    /// Maps a /login endpoint that takes { matricula, senha } and returns a JWT (hackathon — production uses an IdP).
    /// Any non-empty matricula/senha "logs in"; in real production validate against the login service.
    /// </summary>
    public static IEndpointRouteBuilder MapSmartFlowPjLogin(this IEndpointRouteBuilder app)
    {
        static CookieOptions BuildRefreshCookieOptions(bool isHttps) => new()
        {
            HttpOnly = true,
            Secure = isHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        };

        // POST /auth/login - Issues JWT for valid matricula + senha
        app.MapPost("/auth/login", (
            LoginRequest req, 
            JwtTokenIssuer issuer, 
            UsuarioService usuarioService, 
            HttpContext ctx, 
            ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(req.Matricula) || string.IsNullOrWhiteSpace(req.Senha))
            {
                logger.LogWarning("[AUDIT] Tentativa de login inválida | IP: {IP}", ctx.Connection.RemoteIpAddress);
                return Results.Problem(title: "Credenciais inválidas.", statusCode: 401);
            }
            var usuario = usuarioService.ValidarCredenciais(req.Matricula, req.Senha);
            if (usuario is null)
            {
                // Log sem expor qual campo está errado (evita enumeração de usuários)
                logger.LogWarning("[AUDIT] Tentativa de login inválida | IP: {IP}", ctx.Connection.RemoteIpAddress);
                return Results.Problem(title: "Credenciais inválidas.", statusCode: 401);
            }
            var token = issuer.IssueForCustomer(req.Matricula);
            var expiresAt = DateTime.UtcNow.AddMinutes(60); // Adjust this based on your token lifetime
            var usuarioInfo = new UsuarioInfo(usuario.Matricula, usuario.Nome, usuario.Perfil);
            logger.LogInformation("[AUDIT] Login bem-sucedido | Matricula: {Matricula} | IP: {IP}",
                usuario.Matricula, ctx.Connection.RemoteIpAddress);

            var refreshToken = RefreshTokenStore.Issue(usuario.Matricula);
            ctx.Response.Cookies.Append(RefreshCookieName, refreshToken, BuildRefreshCookieOptions(ctx.Request.IsHttps));

            return Results.Ok(new LoginResponse(token, expiresAt, usuarioInfo));
        })
        .WithSummary("Emite JWT (matricula + senha)")
        .RequireRateLimiting("login")
        .WithName("Login")
        .Produces<LoginResponse>()
        .ProducesProblem(401)
        .ProducesProblem(429)
        .WithTags("Autenticação");

        // POST /auth/refresh - Rotates refresh token and returns a new access token.
        app.MapPost("/auth/refresh", (
            JwtTokenIssuer issuer,
            UsuarioService usuarioService,
            HttpContext ctx,
            ILogger<Program> logger) =>
        {
            if (!ctx.Request.Cookies.TryGetValue(RefreshCookieName, out var oldRefreshToken)
                || string.IsNullOrWhiteSpace(oldRefreshToken))
            {
                return Results.Problem(title: "Refresh token ausente.", statusCode: 401);
            }

            if (!RefreshTokenStore.TryConsume(oldRefreshToken, out var matricula))
            {
                return Results.Problem(title: "Refresh token inválido ou expirado.", statusCode: 401);
            }

            var usuario = usuarioService.BuscarPorMatricula(matricula);
            if (usuario is null)
            {
                return Results.Problem(title: "Usuário não encontrado.", statusCode: 401);
            }

            var newAccessToken = issuer.IssueForCustomer(usuario.Matricula);
            var expiresAt = DateTime.UtcNow.AddMinutes(60);
            var usuarioInfo = new UsuarioInfo(usuario.Matricula, usuario.Nome, usuario.Perfil);

            var newRefreshToken = RefreshTokenStore.Issue(usuario.Matricula);
            ctx.Response.Cookies.Append(RefreshCookieName, newRefreshToken, BuildRefreshCookieOptions(ctx.Request.IsHttps));

            logger.LogInformation("[AUDIT] Refresh bem-sucedido | Matricula: {Matricula} | IP: {IP}",
                usuario.Matricula, ctx.Connection.RemoteIpAddress);

            return Results.Ok(new LoginResponse(newAccessToken, expiresAt, usuarioInfo));
        })
        .WithSummary("Renova access token via refresh token HttpOnly")
        .WithName("Refresh")
        .Produces<LoginResponse>()
        .ProducesProblem(401)
        .WithTags("Autenticação");

        // GET /auth/me - Returns current authenticated user profile.
        app.MapGet("/auth/me", (
            UsuarioService usuarioService,
            ClaimsPrincipal user) =>
        {
            var matricula = user.FindFirstValue("matricula")
                            ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                            ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(matricula))
                return Results.Problem(title: "Token inválido.", statusCode: 401);

            var usuario = usuarioService.BuscarPorMatricula(matricula);
            if (usuario is null)
                return Results.Problem(title: "Usuário não encontrado.", statusCode: 401);

            return Results.Ok(new
            {
                matricula = usuario.Matricula,
                nome = usuario.Nome,
                perfil = usuario.Perfil
            });
        })
        .RequireAuthorization()
        .WithSummary("Retorna dados do usuário autenticado")
        .WithName("Me")
        .Produces(200)
        .ProducesProblem(401)
        .WithTags("Autenticação");

        // POST /auth/logout - Invalidate JWT (stateless, so just a placeholder for audit/logging)
        app.MapPost("/auth/logout", (
            HttpContext         ctx,
            ILogger<Program>    logger) =>
        {
            if (ctx.Request.Cookies.TryGetValue(RefreshCookieName, out var refreshToken)
                && !string.IsNullOrWhiteSpace(refreshToken))
            {
                RefreshTokenStore.Revoke(refreshToken);
            }

            ctx.Response.Cookies.Delete(RefreshCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = ctx.Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Path = "/"
            });

            return Results.Ok(new { Mensagem = "Logout realizado com sucesso." });
        })
        .RequireAuthorization()
        .WithName("Logout")
        .WithTags("Autenticação");

        return app;
    }
}

public sealed record LoginRequest(string Matricula, string Senha);
public sealed record LoginResponse(string AccessToken, DateTime ExpiresAt, UsuarioInfo Usuario);
public sealed record UsuarioInfo(string Matricula, string Nome, string Perfil);
public sealed record Usuario(string Matricula, string SenhaHash, string Nome, string Perfil);

internal static class RefreshTokenStore
{
    private sealed record Entry(string Matricula, DateTime ExpiresAt);

    private static readonly Dictionary<string, Entry> Tokens = new();
    private static readonly object Sync = new();
    private static readonly TimeSpan Lifetime = TimeSpan.FromDays(7);

    public static string Issue(string matricula)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));

        lock (Sync)
        {
            Tokens[token] = new Entry(matricula, DateTime.UtcNow.Add(Lifetime));
        }

        return token;
    }

    public static bool TryConsume(string token, out string matricula)
    {
        lock (Sync)
        {
            if (!Tokens.TryGetValue(token, out var entry))
            {
                matricula = string.Empty;
                return false;
            }

            Tokens.Remove(token);
            if (entry.ExpiresAt <= DateTime.UtcNow)
            {
                matricula = string.Empty;
                return false;
            }

            matricula = entry.Matricula;
            return true;
        }
    }

    public static void Revoke(string token)
    {
        lock (Sync)
        {
            Tokens.Remove(token);
        }
    }
}

public sealed class JwtTokenIssuer(JwtClientOptions options)
{
    public string IssueForCustomer(string matricula)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var now = DateTime.UtcNow;
        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims:
            [
                new(JwtRegisteredClaimNames.Sub, matricula),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new("matricula", matricula)
            ],
            notBefore: now,
            expires: now.Add(options.TokenLifetime),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

