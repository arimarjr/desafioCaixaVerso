using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

// =============================================================================
// ENDPOINTS — Autenticação (/auth/*)
// =============================================================================

static class AuthEndpoints
{
    internal static WebApplication MapAuthEndpoints(
        this WebApplication app,
        int refreshTokenDias,
        int accessTokenMinutos)
    {
        var env = app.Environment;  // captura o ambiente uma vez (closure imutável)

        // POST /auth/login
        app.MapPost("/auth/login", async (
            [FromBody] LoginRequest request,
            IUsuarioService     usuarioService,
            IJwtService         jwtService,
            IRefreshTokenStore  refreshTokenStore,
            HttpContext         ctx,
            ILogger<Program>    logger) =>
        {
            // Validação de entrada — evita payloads malformados antes de tocar nos serviços
            if (string.IsNullOrWhiteSpace(request.Matricula) || request.Matricula.Length > 20 ||
                string.IsNullOrWhiteSpace(request.Senha)     || request.Senha.Length < 6 || request.Senha.Length > 100)
                return Results.Problem(title: "Dados de acesso inválidos.", statusCode: 400);

            var usuario = usuarioService.ValidarCredenciais(request.Matricula.Trim(), request.Senha);
            if (usuario is null)
            {
                // Log sem expor qual campo está errado (evita enumeração de usuários)
                logger.LogWarning("[AUDIT] Tentativa de login inválida | IP: {IP}", ctx.Connection.RemoteIpAddress);
                return Results.Problem(title: "Credenciais inválidas.", statusCode: 401);
            }

            var accessToken  = jwtService.GerarAccessToken(usuario);
            var refreshToken = jwtService.GerarRefreshToken();

            refreshTokenStore.Armazenar(
                refreshToken,
                usuario.Matricula,
                DateTime.UtcNow.AddDays(refreshTokenDias));

            ctx.Response.Cookies.Append("refresh_token", refreshToken, CookieHelper.OpcoesRefreshToken(env));

            logger.LogInformation("[AUDIT] Login bem-sucedido | Matricula: {Matricula} | IP: {IP}",
                usuario.Matricula, ctx.Connection.RemoteIpAddress);

            return Results.Ok(new LoginResponse(
                AccessToken: accessToken,
                ExpiresAt:   DateTime.UtcNow.AddMinutes(accessTokenMinutos),
                Usuario:     new UsuarioInfo(usuario.Matricula, usuario.Nome, usuario.Perfil)));
        })
        .RequireRateLimiting("login")
        .WithName("Login")
        .Produces<LoginResponse>()
        .ProducesProblem(401)
        .ProducesProblem(429)
        .WithTags("Autenticação");

        // POST /auth/refresh — renova o access token via refresh token (HttpOnly cookie)
        app.MapPost("/auth/refresh", (
            HttpContext         ctx,
            IRefreshTokenStore  refreshTokenStore,
            IJwtService         jwtService,
            IUsuarioService     usuarioService,
            ILogger<Program>    logger) =>
        {
            var refreshToken = ctx.Request.Cookies["refresh_token"];

            if (string.IsNullOrEmpty(refreshToken))
                return Results.Problem(title: "Refresh token ausente.", statusCode: 401);

            var entry = refreshTokenStore.Buscar(refreshToken);
            if (entry is null || entry.Expiracao < DateTime.UtcNow)
            {
                ctx.Response.Cookies.Delete("refresh_token", new CookieOptions { Path = "/" });
                return Results.Problem(title: "Refresh token inválido ou expirado.", statusCode: 401);
            }

            var usuario = usuarioService.BuscarPorMatricula(entry.Matricula);
            if (usuario is null)
                return Results.Problem(title: "Usuário não encontrado.", statusCode: 401);

            // Rotação do refresh token: revoga o antigo, emite novo
            refreshTokenStore.Revogar(refreshToken);
            var novoRefreshToken = jwtService.GerarRefreshToken();
            refreshTokenStore.Armazenar(
                novoRefreshToken,
                usuario.Matricula,
                DateTime.UtcNow.AddDays(refreshTokenDias));

            ctx.Response.Cookies.Append("refresh_token", novoRefreshToken, CookieHelper.OpcoesRefreshToken(env));

            var novoAccessToken = jwtService.GerarAccessToken(usuario);

            logger.LogInformation("[AUDIT] Refresh token rotacionado | Matricula: {Matricula}", usuario.Matricula);

            return Results.Ok(new LoginResponse(
                AccessToken: novoAccessToken,
                ExpiresAt:   DateTime.UtcNow.AddMinutes(accessTokenMinutos),
                Usuario:     new UsuarioInfo(usuario.Matricula, usuario.Nome, usuario.Perfil)));
        })
        .WithName("Refresh")
        .Produces<LoginResponse>()
        .ProducesProblem(401)
        .WithTags("Autenticação");

        // POST /auth/logout — revoga o refresh token e limpa o cookie
        app.MapPost("/auth/logout", (
            HttpContext         ctx,
            IRefreshTokenStore  refreshTokenStore,
            ILogger<Program>    logger) =>
        {
            var refreshToken = ctx.Request.Cookies["refresh_token"];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                refreshTokenStore.Revogar(refreshToken);
                logger.LogInformation("[AUDIT] Logout realizado — refresh token revogado.");
            }

            ctx.Response.Cookies.Delete("refresh_token", new CookieOptions { Path = "/" });
            return Results.Ok(new { Mensagem = "Logout realizado com sucesso." });
        })
        .RequireAuthorization()
        .WithName("Logout")
        .WithTags("Autenticação");

        // GET /auth/me — retorna dados do usuário autenticado (valida JWT)
        app.MapGet("/auth/me", (ClaimsPrincipal user) =>
        {
            var matricula = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            var nome      = user.FindFirst(ClaimTypes.Name)?.Value           ?? string.Empty;
            var perfil    = user.FindFirst(ClaimTypes.Role)?.Value           ?? string.Empty;

            return Results.Ok(new UsuarioInfo(matricula, nome, perfil));
        })
        .RequireAuthorization()
        .WithName("Me")
        .Produces<UsuarioInfo>()
        .WithTags("Autenticação");

        return app;
    }
}
