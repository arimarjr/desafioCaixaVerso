// =============================================================================
// PLATAFORMA PESSOA JURÍDICA — Backend ASP.NET Core 9 Minimal API
// Autenticação JWT com Refresh Token + HttpOnly Cookie
//
// Estrutura de arquivos:
//   Models/Records.cs             — records de dados
//   Interfaces/IServices.cs       — contratos de serviço
//   Services/UsuarioService.cs    — autenticação de usuários (bcrypt)
//   Services/RefreshTokenStore.cs — store in-memory de refresh tokens
//   Services/JwtService.cs        — geração de JWT e refresh token opaco
//   Services/EmpresasService.cs   — índice in-memory de empresas (JSON)
//   Helpers/CookieHelper.cs       — opções de cookie por ambiente
//   Endpoints/AuthEndpoints.cs    — endpoints /auth/*
//   Endpoints/EmpresasEndpoints.cs — endpoints /empresas/*
//
// ATENÇÃO: Jwt:Secret deve estar em user-secrets ou variável de ambiente em produção.
//          Nunca versionar segredos. Em dev: appsettings.Development.json (não comitar).
// =============================================================================

using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using PlataformaPJ.Options;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Configuração obrigatória: Jwt:Secret via user-secrets ou variável de ambiente
// Em produção: defina a variável de ambiente  Jwt__Secret  (não use appsettings!)
// ---------------------------------------------------------------------------
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException(
        "Configuração 'Jwt:Secret' não encontrada. " +
        "Use 'dotnet user-secrets set \"Jwt:Secret\" \"<chave>\"' em dev, " +
        "ou variável de ambiente Jwt__Secret em produção.");

var jwtIssuer         = builder.Configuration["Jwt:Issuer"]   ?? "plataforma-pj";
var jwtAudience       = builder.Configuration["Jwt:Audience"] ?? "plataforma-pj-client";
var accessTokenMinutos = builder.Configuration.GetValue("Jwt:AccessTokenExpiracaoMinutos", 15);
var refreshTokenDias  = builder.Configuration.GetValue("Jwt:RefreshTokenExpiracaoDias", 7);

// BcryptWorkFactor: 4 em dev (rápido), 12 em prod (seguro). Ver appsettings.*.json.
var bcryptWorkFactor = builder.Configuration.GetValue("BcryptWorkFactor", 12);

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:4200"];

// ---------------------------------------------------------------------------
// Serviços de domínio
// ---------------------------------------------------------------------------
var empresasPath   = Path.Combine(builder.Environment.ContentRootPath, "DataBase", "cadastroEmpresas.json");
var avaliacoesPath = Path.Combine(builder.Environment.ContentRootPath, "DataBase", "avaliacoes.json");

builder.Services.AddSingleton<IEmpresasService>(new EmpresasService(empresasPath));
builder.Services.AddSingleton<IAvaliacaoService>(new AvaliacaoService(avaliacoesPath));

// Pesquisas / upload de documentos
builder.Services.Configure<ArquivosDocumentosOptions>(
    builder.Configuration.GetSection("ArquivosDocumentos"));
builder.Services.AddScoped<IPesquisasDocumentosService, PesquisasDocumentosService>();

// Contratos / CCB
builder.Services.AddScoped<IContratoService, ContratoService>();

builder.Services.AddSingleton<IUsuarioService>(
    _ => new UsuarioService(refreshTokenDias, bcryptWorkFactor));

builder.Services.AddSingleton<IRefreshTokenStore, RefreshTokenStore>();

builder.Services.AddSingleton<IJwtService>(
    _ => new JwtService(jwtSecret, jwtIssuer, jwtAudience, accessTokenMinutos));

// ---------------------------------------------------------------------------
// Autenticação JWT Bearer
// ---------------------------------------------------------------------------
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAudience,
            IssuerSigningKey         = signingKey,
            ClockSkew                = TimeSpan.Zero,  // sem tolerância de clock
        };
    });

builder.Services.AddAuthorization();

// ---------------------------------------------------------------------------
// CORS — origens restritas + credenciais (necessário para cookies)
// ---------------------------------------------------------------------------
builder.Services.AddCors(options =>
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .WithMethods("GET", "POST", "OPTIONS")
              .AllowCredentials()));    // obrigatório para HttpOnly cookies

// ---------------------------------------------------------------------------
// Rate Limiting — protege endpoint de login contra força bruta
// ---------------------------------------------------------------------------
builder.Services.AddRateLimiter(options =>
{
    // Login: máximo 5 tentativas por minuto por IP
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.PermitLimit            = 5;
        opt.Window                 = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder   = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit             = 0;
    });

    // API geral: 120 req/min por IP — evita scraping e abuso
    options.AddFixedWindowLimiter("api", opt =>
    {
        opt.PermitLimit          = 120;
        opt.Window               = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit           = 0;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ---------------------------------------------------------------------------
// ProblemDetails — erros padronizados (RFC 7807)
// ---------------------------------------------------------------------------
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = ctx =>
    {
        // Remove stack trace e detalhes internos em produção
        ctx.ProblemDetails.Extensions.Remove("exception");
        if (!ctx.HttpContext.RequestServices
                .GetRequiredService<IHostEnvironment>()
                .IsDevelopment()
            && ctx.ProblemDetails.Status >= 500)
        {
            ctx.ProblemDetails.Detail = "Ocorreu um erro interno. Contacte o suporte.";
        }
    };
});

builder.Services.AddOpenApi();

// ---------------------------------------------------------------------------
// Pipeline HTTP
// ---------------------------------------------------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

// CORS deve vir ANTES de UseHttpsRedirection para que
// o preflight OPTIONS e o redirect 307 carreguem os headers CORS.
app.UseCors("FrontendPolicy");

// ---------------------------------------------------------------------------
// Security Headers — defesa em profundidade contra XSS, clickjacking, MIME sniff
// ---------------------------------------------------------------------------
app.Use(async (ctx, next) =>
{
    var h = ctx.Response.Headers;
    // Impede MIME-type sniffing
    h["X-Content-Type-Options"] = "nosniff";
    // Bloqueia renderização em <iframe> (clickjacking)
    h["X-Frame-Options"] = "DENY";
    // Limita informações no Referer ao enviar requisições cross-origin
    h["Referrer-Policy"] = "strict-origin-when-cross-origin";
    // Desabilita APIs de hardware não utilizadas
    h["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";
    // Content Security Policy — restringe origens de scripts, estilos e conexões
    h["Content-Security-Policy"] =
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self';";
    await next();
});

// HTTPS obrigatório apenas em produção;
// em dev evita problemas com cert auto-assinado e redirect sem CORS.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// ---------------------------------------------------------------------------
// Endpoints (implementados como extension methods em Endpoints/)
// ---------------------------------------------------------------------------
app.MapAuthEndpoints(refreshTokenDias, accessTokenMinutos);
app.MapEmpresasEndpoints();
app.MapPesquisasDocumentosEndpoints();
app.MapContratosEndpoints();
app.MapAvaliacoesEndpoints();

app.Run();
