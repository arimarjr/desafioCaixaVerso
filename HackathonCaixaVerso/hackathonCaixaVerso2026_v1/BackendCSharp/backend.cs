// =============================================================================
// PLATAFORMA PESSOA JURÍDICA — Backend ASP.NET Core 9 Minimal API
// Autenticação JWT com Refresh Token + HttpOnly Cookie
// ATENÇÃO: Jwt:Secret deve estar em user-secrets ou variável de ambiente em produção.
//          Nunca versionar segredos. Em dev: appsettings.Development.json (não comitar).
// =============================================================================

using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

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

var jwtIssuer   = builder.Configuration["Jwt:Issuer"]   ?? "plataforma-pj";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "plataforma-pj-client";
var accessTokenHoras  = builder.Configuration.GetValue("Jwt:AccessTokenExpiracaoHoras", 1);
var refreshTokenDias  = builder.Configuration.GetValue("Jwt:RefreshTokenExpiracaoDias", 7);

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:4200"];

// ---------------------------------------------------------------------------
// Serviços de domínio
// ---------------------------------------------------------------------------
builder.Services.AddSingleton<IUsuarioService>(
    _ => new UsuarioService(refreshTokenDias));

builder.Services.AddSingleton<IRefreshTokenStore, RefreshTokenStore>();

builder.Services.AddSingleton<IJwtService>(
    _ => new JwtService(jwtSecret, jwtIssuer, jwtAudience, accessTokenHoras));

builder.Services.AddSingleton<IEmpresaMockService>(_ =>
    new EmpresaMockService(
        Path.Combine(builder.Environment.ContentRootPath, "DataBase", "cadastroEmpresas.json")));

builder.Services.AddSingleton<IAvaliacoesPersistenciaService>(_ =>
    new AvaliacoesPersistenciaService(
        Path.Combine(builder.Environment.ContentRootPath, "DataBase", "avaliacoes.json")));

var diretorioArquivos = builder.Configuration["ArquivosDocumentos:DiretorioBase"]
    ?? Path.Combine(builder.Environment.ContentRootPath, "arquivosDocumentos");
builder.Services.AddSingleton<PesquisasDocumentosService>(
    _ => new PesquisasDocumentosService(diretorioArquivos));

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 20 * 1024 * 1024; // 20 MB
});

// Serialização JSON: camelCase para compatibilidade com o frontend Angular
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy        = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
});

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
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.PermitLimit            = 5;
        opt.Window                 = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder   = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit             = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ---------------------------------------------------------------------------
// ProblemDetails — erros padronizados (RFC 7807)
// ---------------------------------------------------------------------------
builder.Services.AddProblemDetails();

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
// Endpoints de autenticação
// ---------------------------------------------------------------------------

// POST /auth/login
app.MapPost("/auth/login", async (
    [FromBody] LoginRequest request,
    IUsuarioService     usuarioService,
    IJwtService         jwtService,
    IRefreshTokenStore  refreshTokenStore,
    HttpContext         ctx,
    ILogger<Program>    logger) =>
{
    var usuario = usuarioService.ValidarCredenciais(request.Matricula, request.Senha);
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

    ctx.Response.Cookies.Append(
        "refresh_token",
        refreshToken,
        CookieOpcoesParaRefreshToken(app.Environment));

    logger.LogInformation("[AUDIT] Login bem-sucedido | Matricula: {Matricula} | IP: {IP}",
        usuario.Matricula, ctx.Connection.RemoteIpAddress);

    return Results.Ok(new LoginResponse(
        AccessToken: accessToken,
        ExpiresAt:   DateTime.UtcNow.AddHours(accessTokenHoras),
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
        // Limpa cookie inválido
        ctx.Response.Cookies.Delete("refresh_token",
            new CookieOptions { Path = "/" });
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

    ctx.Response.Cookies.Append(
        "refresh_token",
        novoRefreshToken,
        CookieOpcoesParaRefreshToken(app.Environment));

    var novoAccessToken = jwtService.GerarAccessToken(usuario);

    logger.LogInformation("[AUDIT] Refresh token rotacionado | Matricula: {Matricula}", usuario.Matricula);

    return Results.Ok(new LoginResponse(
        AccessToken: novoAccessToken,
        ExpiresAt:   DateTime.UtcNow.AddHours(accessTokenHoras),
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

    ctx.Response.Cookies.Delete("refresh_token",
        new CookieOptions { Path = "/" });

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

// ---------------------------------------------------------------------------
// Endpoints de Empresas
// ---------------------------------------------------------------------------

// GET /empresas/{cnpj} — busca empresa pelo CNPJ (somente dígitos)
// Obs: o proxy Angular reescreve /api/empresas/{cnpj} → /empresas/{cnpj}
app.MapGet("/empresas/{cnpj}", (string cnpj, IEmpresaMockService empresaService) =>
{
    var cnpjLimpo = new string(cnpj.Where(char.IsDigit).ToArray());
    var empresa = empresaService.BuscarPorCnpj(cnpjLimpo);
    return empresa is not null
        ? Results.Ok(empresa.Value)
        : Results.NotFound(new { mensagem = $"CNPJ {cnpj} não encontrado na base de dados mock." });
})
.RequireAuthorization()
.WithName("BuscarEmpresa")
.WithTags("Empresas");

// POST /avaliacoes/avaliar — avalia empresa com base nos dados mock
// Regra: empresas SEM restrição cadastral recebem SEMPRE rating A (aprovação garantida).
//        Limite = 30% do faturamento anual 2025 (já calculado no JSON).
//        Empresas COM restrição → REPROVADO imediato.
// Obs: o proxy Angular reescreve /api/avaliacoes/avaliar → /avaliacoes/avaliar
app.MapPost("/avaliacoes/avaliar", (
    [FromBody] AvaliarEmpresaRequest request,
    IEmpresaMockService empresaService,
    IAvaliacoesPersistenciaService persistencia,
    ClaimsPrincipal user) =>
{
    var cnpjLimpo = new string(request.Cnpj.Where(char.IsDigit).ToArray());
    var matriculaGerente = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

    // Verifica se a empresa existe no mock
    var empresa = empresaService.BuscarPorCnpj(cnpjLimpo);
    if (empresa is null)
        return Results.NotFound(new { mensagem = "CNPJ não encontrado para avaliação." });

    // Extrai razão social, porte e segmento para enriquecer o registro persistido
    var razaoSocial  = string.Empty;
    var porteEmpresa = string.Empty;
    var segmento     = string.Empty;
    if (empresa.Value.TryGetProperty("cadastroEmpresa", out var cadastroEl))
    {
        if (cadastroEl.TryGetProperty("razaoSocial", out var rsProp))
            razaoSocial  = rsProp.GetString() ?? string.Empty;
        if (cadastroEl.TryGetProperty("porteCaixa",  out var porteProp))
            porteEmpresa = PorteHelper.Mapear(porteProp.GetString() ?? string.Empty);
        if (cadastroEl.TryGetProperty("segmento",    out var segProp))
            segmento     = segProp.GetString() ?? string.Empty;
    }

    // Verifica restrição cadastral
    bool temRestricao = false;
    if (empresa.Value.TryGetProperty("cadastroEmpresa", out var cadastro) &&
        cadastro.TryGetProperty("restricaoCadastral", out var restricaoProp))
    {
        temRestricao = restricaoProp.GetBoolean();
    }

    ResultadoAvaliacaoResponse resposta;

    if (temRestricao)
    {
        resposta = new ResultadoAvaliacaoResponse(
            Resultado:             "REPROVADO",
            Justificativa:         "Empresa com restrições cadastrais impeditivas para avaliação de crédito. Informe ao cliente e solicite a regularização. Após regularizado poderá ser avaliado.",
            LimiteAprovado:        null,
            ValoresJaContratados:  0.0,
            ClassificacaoRisco:    "E",
            ScoreInterno:          350,
            DataAvaliacao:         DateTime.Now.ToString("dd/MM/yyyy HH:mm"));
    }
    else
    {
        // Sem restrição → sempre APROVADO com rating A
        var mock = empresaService.BuscarDadosAvaliacao(cnpjLimpo);
        if (mock is null)
            return Results.NotFound(new { mensagem = "Dados de avaliação não encontrados." });

        resposta = new ResultadoAvaliacaoResponse(
            Resultado:            "APROVADO",
            Justificativa:        $"Empresa aprovada com Rating A. Score: {mock.ScoreInterno}. Limite corresponde a 30% do faturamento anual. {mock.Observacao}",
            LimiteAprovado:       mock.LimiteSugerido,
            ValoresJaContratados: 0.0,
            ClassificacaoRisco:   "A",
            ScoreInterno:         mock.ScoreInterno,
            DataAvaliacao:        DateTime.Now.ToString("dd/MM/yyyy HH:mm"));
    }

    // Persiste o resultado para análise futura por IA
    persistencia.Salvar(new RegistroAvaliacao(
        Id:                   Guid.NewGuid().ToString(),
        Cnpj:                 cnpjLimpo,
        RazaoSocial:          razaoSocial,
        PorteEmpresa:         porteEmpresa,
        Segmento:             segmento,
        MatriculaGerente:     matriculaGerente,
        DataAvaliacaoIso:     DateTime.UtcNow.ToString("o"),
        Resultado:            resposta.Resultado,
        Justificativa:        resposta.Justificativa,
        LimiteAprovado:       resposta.LimiteAprovado,
        ValoresJaContratados: resposta.ValoresJaContratados,
        ClassificacaoRisco:   resposta.ClassificacaoRisco,
        ScoreInterno:         resposta.ScoreInterno,
        DadosAdministrativos: request.DadosAdministrativos));

    return Results.Ok(resposta);
})
.RequireAuthorization()
.WithName("AvaliarEmpresa")
.WithTags("Avaliacoes");

// GET /avaliacoes — lista todos os registros persistidos (para análise por IA)
app.MapGet("/avaliacoes", (IAvaliacoesPersistenciaService persistencia) =>
    Results.Ok(persistencia.Listar()))
.RequireAuthorization()
.WithName("ListarAvaliacoes")
.WithTags("Avaliacoes");

// ---------------------------------------------------------------------------
// Upload de documentos de pesquisas
// ---------------------------------------------------------------------------
app.MapPost("/pesquisas-documentos/upload", async (
    [FromForm] string identificadorEmpresa,
    [FromForm] string pesquisaId,
    [FromForm] string nomePesquisa,
    IFormFile arquivo,
    PesquisasDocumentosService pesquisasService,
    CancellationToken ct) =>
{
    try
    {
        var resposta = await pesquisasService.SalvarDocumentoAsync(
            identificadorEmpresa, pesquisaId, nomePesquisa, arquivo, ct);
        return Results.Ok(resposta);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { sucesso = false, mensagem = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
})
.RequireAuthorization()
.DisableAntiforgery()
.WithName("UploadPesquisaDocumento")
.WithTags("Pesquisas");

app.Run();

// ---------------------------------------------------------------------------
// Helper: opções de cookie seguro por ambiente
// ---------------------------------------------------------------------------
static CookieOptions CookieOpcoesParaRefreshToken(IWebHostEnvironment env) => new()
{
    HttpOnly = true,
    Secure   = !env.IsDevelopment(),                          // HTTPS obrigatório em prod
    SameSite = env.IsDevelopment() ? SameSiteMode.Lax        // Lax permite cross-origin em dev (localhost)
                                   : SameSiteMode.Strict,     // Strict bloqueia cross-site em prod
    Expires  = DateTimeOffset.UtcNow.AddDays(7),
    Path     = "/",  // "/" necessário ao usar proxy Angular (/api/*→/*); HttpOnly já protege contra XSS
};


// =============================================================================
// MODELOS / RECORDS
// =============================================================================

record LoginRequest(string Matricula, string Senha);
record LoginResponse(string AccessToken, DateTime ExpiresAt, UsuarioInfo Usuario);
record UsuarioInfo(string Matricula, string Nome, string Perfil);
record UsuarioMock(string Matricula, string SenhaHash, string Nome, string Perfil);
record RefreshTokenEntry(string Matricula, DateTime Expiracao);


// =============================================================================
// INTERFACES
// =============================================================================

interface IUsuarioService
{
    UsuarioMock? ValidarCredenciais(string matricula, string senha);
    UsuarioMock? BuscarPorMatricula(string matricula);
}

interface IRefreshTokenStore
{
    void Armazenar(string token, string matricula, DateTime expiracao);
    RefreshTokenEntry? Buscar(string token);
    void Revogar(string token);
}

interface IJwtService
{
    string GerarAccessToken(UsuarioMock usuario);
    string GerarRefreshToken();
}


// =============================================================================
// SERVIÇO DE USUÁRIOS — Base mock com senhas hashadas (bcrypt + salt automático)
// Em produção: substituir por repositório com banco de dados
// =============================================================================

class UsuarioService : IUsuarioService
{
    // Whitelist inicial de usuários autorizados.
    // Senhas são hashadas com BCrypt (custo 12) na inicialização.
    // Senha inicial = matrícula (ex.: c128661 → senha "c128661")
    private readonly IReadOnlyList<UsuarioMock> _usuarios;

    public UsuarioService(int _ /* refreshTokenDias — reservado para expansão */)
    {
        _usuarios = new List<UsuarioMock>
        {
            Criar("c128661", "Arimar Silva Soares Júnior",         "GERENTE_PJ"),
            Criar("c129435", "Viviene Arruda José",                "GERENTE_PJ"),
            Criar("c087327", "Rodrigo Francisco Bisol",            "GERENTE_PJ"),
            Criar("c128363", "Wendel Alves da Silva",              "GERENTE_PJ"),
            Criar("c137544", "Maria Regiane Silva dos Santos",     "GERENTE_PJ"),
            Criar("c148050", "Luciana de Matos Andrade",           "GERENTE_PJ"),
        }.AsReadOnly();
    }

    // Senha inicial = matrícula; hash com bcrypt work-factor 12
    private static UsuarioMock Criar(string matricula, string nome, string perfil) =>
        new(matricula, BCrypt.Net.BCrypt.HashPassword(matricula, workFactor: 12), nome, perfil);

    public UsuarioMock? ValidarCredenciais(string matricula, string senha)
    {
        var usuario = _usuarios.FirstOrDefault(u =>
            string.Equals(u.Matricula, matricula, StringComparison.OrdinalIgnoreCase));

        if (usuario is null) return null;

        // BCrypt.Verify faz a comparação em tempo constante (evita timing attacks)
        return BCrypt.Net.BCrypt.Verify(senha, usuario.SenhaHash) ? usuario : null;
    }

    public UsuarioMock? BuscarPorMatricula(string matricula) =>
        _usuarios.FirstOrDefault(u =>
            string.Equals(u.Matricula, matricula, StringComparison.OrdinalIgnoreCase));
}


// =============================================================================
// STORE DE REFRESH TOKENS — In-memory (thread-safe)
// Em produção: substituir por Redis ou tabela de banco com TTL
// =============================================================================

class RefreshTokenStore : IRefreshTokenStore
{
    private readonly ConcurrentDictionary<string, RefreshTokenEntry> _store = new();

    public void Armazenar(string token, string matricula, DateTime expiracao) =>
        _store[token] = new RefreshTokenEntry(matricula, expiracao);

    public RefreshTokenEntry? Buscar(string token) =>
        _store.TryGetValue(token, out var entry) ? entry : null;

    public void Revogar(string token) =>
        _store.TryRemove(token, out _);
}


// =============================================================================
// SERVIÇO JWT — Geração de access token (signed) e refresh token (opaque)
// =============================================================================

class JwtService : IJwtService
{
    private readonly SigningCredentials _signingCredentials;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int    _accessTokenHoras;

    public JwtService(string secret, string issuer, string audience, int accessTokenHoras)
    {
        if (secret.Length < 32)
            throw new InvalidOperationException("Jwt:Secret deve ter no mínimo 32 caracteres.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        _signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        _issuer             = issuer;
        _audience           = audience;
        _accessTokenHoras   = accessTokenHoras;
    }

    public string GerarAccessToken(UsuarioMock usuario)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Matricula),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier,   usuario.Matricula),
            new Claim(ClaimTypes.Name,             usuario.Nome),
            new Claim(ClaimTypes.Role,             usuario.Perfil),
        };

        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(_accessTokenHoras),
            signingCredentials: _signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Refresh token opaco: 64 bytes criptograficamente aleatórios em Base64
    public string GerarRefreshToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}


// =============================================================================
// SERVIÇO DE EMPRESAS MOCK — Lê cadastroEmpresas.json em memória
// =============================================================================

interface IEmpresaMockService
{
    JsonElement? BuscarPorCnpj(string cnpjDigits);
    AvaliacaoMockInfo? BuscarDadosAvaliacao(string cnpjDigits);
}

record AvaliacaoMockInfo(
    int    ScoreInterno,
    string ClassificacaoRisco,
    double LimiteSugerido,
    string Observacao);

record AvaliarEmpresaRequest(
    string                     Cnpj,
    DadosAdministrativosRequest DadosAdministrativos);

record DadosAdministrativosRequest(
    string DocumentoFaturamento,
    string DataUltimaAtualizacaoContratual,
    bool   AlterouSociosMaior50,
    bool   ExcluiuAdministradoresAnteriores,
    bool   AlterouObjetoSocial,
    bool   AlterouCnaePrincipal,
    bool   AlterouMunicipio,
    bool   DeixouSerSociedadeSimples,
    string PvResponsavel);

record ResultadoAvaliacaoResponse(
    string  Resultado,
    string  Justificativa,
    double? LimiteAprovado,
    double  ValoresJaContratados,
    string  ClassificacaoRisco,
    int     ScoreInterno,
    string  DataAvaliacao);

// =============================================================================
// SERVIÇO DE PERSISTÊNCIA DE AVALIAÇÕES DE CRÉDITO
// =============================================================================

interface IAvaliacoesPersistenciaService
{
    void Salvar(RegistroAvaliacao registro);
    IReadOnlyList<RegistroAvaliacao> Listar();
}

record RegistroAvaliacao(
    string                      Id,
    string                      Cnpj,
    string                      RazaoSocial,
    string                      PorteEmpresa,
    string                      Segmento,
    string                      MatriculaGerente,
    string                      DataAvaliacaoIso,
    string                      Resultado,
    string                      Justificativa,
    double?                     LimiteAprovado,
    double                      ValoresJaContratados,
    string                      ClassificacaoRisco,
    int                         ScoreInterno,
    DadosAdministrativosRequest DadosAdministrativos);

static class PorteHelper
{
    public static string Mapear(string porteCaixa) => porteCaixa.ToUpperInvariant() switch
    {
        "PEQUENA" => "Pequena Empresa",
        "MICRO"   => "Microempresa",
        "MEI"     => "MEI",
        "MEDIA"   => "Média Empresa",
        "GRANDE"  => "Grande Empresa",
        var outro => outro,
    };
}

class AvaliacoesPersistenciaService : IAvaliacoesPersistenciaService
{
    private readonly string _arquivo;
    private readonly object _lock = new();
    private readonly JsonSerializerOptions _opts = new()
    {
        PropertyNamingPolicy        = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented               = true,
    };

    public AvaliacoesPersistenciaService(string arquivo)
    {
        _arquivo = arquivo;
        if (!File.Exists(_arquivo))
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_arquivo)!);
            File.WriteAllText(_arquivo,
                JsonSerializer.Serialize(new AvaliacoesWrapper(), _opts));
        }
    }

    public void Salvar(RegistroAvaliacao registro)
    {
        lock (_lock)
        {
            var lista = _Ler();
            lista.Add(registro);
            _Gravar(lista);
        }
    }

    public IReadOnlyList<RegistroAvaliacao> Listar()
    {
        lock (_lock) { return _Ler().AsReadOnly(); }
    }

    private List<RegistroAvaliacao> _Ler()
    {
        var json    = File.ReadAllText(_arquivo);
        var wrapper = JsonSerializer.Deserialize<AvaliacoesWrapper>(json, _opts);
        return wrapper?.Avaliacoes ?? [];
    }

    private void _Gravar(List<RegistroAvaliacao> lista) =>
        File.WriteAllText(_arquivo,
            JsonSerializer.Serialize(new AvaliacoesWrapper { Avaliacoes = lista }, _opts));

    private class AvaliacoesWrapper
    {
        public List<RegistroAvaliacao> Avaliacoes { get; set; } = [];
    }
}

// =============================================================================
// SERVIÇO DE DOCUMENTOS DE PESQUISAS
// =============================================================================

record UploadPesquisaResponseDto(
    bool   Sucesso,
    string Mensagem,
    string Identificador,
    string PesquisaId,
    string NomeOriginal,
    string NomeSalvo,
    string CaminhoRelativo);

class PesquisasDocumentosService
{
    private const long MaxBytes = 20 * 1024 * 1024; // 20 MB
    private readonly string _dirBase;

    public PesquisasDocumentosService(string diretorioBase)
    {
        _dirBase = diretorioBase;
        Directory.CreateDirectory(_dirBase);
    }

    public async Task<UploadPesquisaResponseDto> SalvarDocumentoAsync(
        string identificadorEmpresa,
        string pesquisaId,
        string nomePesquisa,
        IFormFile arquivo,
        CancellationToken ct)
    {
        if (arquivo is null || arquivo.Length == 0)
            throw new InvalidOperationException("Nenhum arquivo recebido.");

        if (arquivo.Length > MaxBytes)
            throw new InvalidOperationException("Arquivo excede o limite de 20 MB.");

        var ext = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
        if (ext != ".pdf")
            throw new InvalidOperationException("Somente arquivos PDF são aceitos.");

        var idNorm    = NormalizarNomeDiretorio(identificadorEmpresa);
        var dirEmpresa = Path.Combine(_dirBase, idNorm);
        Directory.CreateDirectory(dirEmpresa);

        var timestamp  = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        var nomePesqNorm = NormalizarNomeArquivo(nomePesquisa);
        var pesqIdNorm   = NormalizarNomeArquivo(pesquisaId);
        var nomeSalvo    = $"{timestamp}_{pesqIdNorm}_{nomePesqNorm}.pdf";
        var caminhoFull  = Path.Combine(dirEmpresa, nomeSalvo);

        await using var stream = File.Create(caminhoFull);
        await arquivo.CopyToAsync(stream, ct);

        var caminhoRelativo = Path.Combine(idNorm, nomeSalvo);

        return new UploadPesquisaResponseDto(
            Sucesso:          true,
            Mensagem:         "Arquivo salvo com sucesso.",
            Identificador:    idNorm,
            PesquisaId:       pesquisaId,
            NomeOriginal:     arquivo.FileName,
            NomeSalvo:        nomeSalvo,
            CaminhoRelativo:  caminhoRelativo);
    }

    private static string NormalizarNomeDiretorio(string valor)
    {
        var apenas = new string(valor.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_').ToArray());
        return string.IsNullOrEmpty(apenas) ? "SEM-ID" : apenas.ToUpperInvariant();
    }

    private static string NormalizarNomeArquivo(string valor)
    {
        var normalizado = valor.Normalize(System.Text.NormalizationForm.FormD);
        var semAcento   = new string(normalizado
            .Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c)
                        != System.Globalization.UnicodeCategory.NonSpacingMark)
            .ToArray());
        var limpo = new string(semAcento
            .Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_')
            .ToArray());
        return string.IsNullOrEmpty(limpo) ? "arquivo" : limpo.ToLowerInvariant();
    }
}

class EmpresaMockService : IEmpresaMockService
{
    private readonly Dictionary<string, JsonElement>        _porCnpj     = new();
    private readonly Dictionary<string, AvaliacaoMockInfo> _avaliacoes   = new();

    public EmpresaMockService(string jsonPath)
    {
        if (!File.Exists(jsonPath))
            throw new FileNotFoundException(
                $"Base de dados mock não encontrada: {jsonPath}");

        var json = File.ReadAllText(jsonPath);
        using var doc = JsonDocument.Parse(json);
        var empresas = doc.RootElement.GetProperty("empresas");

        foreach (var empresa in empresas.EnumerateArray())
        {
            var cnpjRaw    = empresa.GetProperty("cadastroEmpresa")
                                    .GetProperty("cnpj")
                                    .GetString() ?? string.Empty;
            var cnpjDigits = new string(cnpjRaw.Where(char.IsDigit).ToArray());
            if (string.IsNullOrEmpty(cnpjDigits)) continue;

            _porCnpj[cnpjDigits] = empresa.Clone();   // Clone: independente do JsonDocument

            if (empresa.TryGetProperty("avaliacaoCreditoMock", out var avm))
            {
                _avaliacoes[cnpjDigits] = new AvaliacaoMockInfo(
                    ScoreInterno:       avm.GetProperty("scoreInterno").GetInt32(),
                    ClassificacaoRisco: avm.GetProperty("classificacaoRisco").GetString() ?? "",
                    LimiteSugerido:     avm.GetProperty("limiteSugerido").GetDouble(),
                    Observacao:         avm.GetProperty("observacao").GetString() ?? "");
            }
        }
    }

    public JsonElement? BuscarPorCnpj(string cnpjDigits) =>
        _porCnpj.TryGetValue(cnpjDigits, out var e) ? e : null;

    public AvaliacaoMockInfo? BuscarDadosAvaliacao(string cnpjDigits) =>
        _avaliacoes.TryGetValue(cnpjDigits, out var a) ? a : null;
}
