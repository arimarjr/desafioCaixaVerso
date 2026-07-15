using Application.Services;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Configuration;
using Domain.Interfaces;
using Infra.Auth;
using Infra.Data;
using Infra.Extensions;
using Infra.Repository;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());

// Adding OpenTelemetry logging
builder.Logging.AddObservabilityLogging(builder.Configuration);

// Add services to the container.
builder.Services.AddHealthChecks();

// Adding service discovery (e.g., Consul, Eureka) for HttpClient integration.
builder.Services.AddServiceDiscovery();

// Configuring HttpClient with resilience and service discovery.
builder.Services.ConfigureHttpClientDefaults(http =>
{
    // Standard resilience: total timeout, retries with jitter, circuit breaker.
    http.AddStandardResilienceHandler();
    // Service discovery so HttpClient.BaseAddress="http://smartflowpj" resolves to the right host.
    http.AddServiceDiscovery();
});

builder.Services.AddControllers();
builder.Services.Configure<RouteOptions>(options =>
{
    options.ConstraintMap["cnpj"] = typeof(CnpjRouteConstraint);
});

// Configuring OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen( c =>
{
    c.SwaggerDoc("v1", new() { Title = "SmartFlowPJ API", Version = "v1" });
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter JWT with Bearer into field",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configuring Observability (OpenTelemetry)
builder.Services.AddObservability(builder.Configuration);

// Configuring ProblemDetails for standardized error responses
builder.Services.AddProblemDetails();

// Configuring JWT Authentication
builder.Services.AddSingleton<UsuarioService>();
builder.Services.AddSmartFlowPjJwtAuth(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAny", builder => builder
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader()
    );
});

var keyVaultUrl = builder.Configuration.GetValue<string>("ConnectionStrings:UrlKeyVault");
Azure.Core.TokenCredential credential = new DefaultAzureCredential();
if (builder.Environment.IsDevelopment())
{
    credential = new InteractiveBrowserCredential();
}
var secretClient = new SecretClient(new Uri(keyVaultUrl!), credential);
builder.Services.AddSingleton(secretClient);

AppSettings.Inicializar(builder.Configuration, secretClient);

// Database contexts for read and write separation
builder.Services.AddDbContext<EscritaContext>(
    options =>
    {
        options.UseSqlServer(AppSettings.ConnectionStrings.Escrita,
        providerOptions => providerOptions.EnableRetryOnFailure());
    });

builder.Services.AddDbContext<LeituraContext>(
    options =>
    {
        options.UseSqlServer(AppSettings.ConnectionStrings.Leitura,
        providerOptions => providerOptions.EnableRetryOnFailure()).EnableSensitiveDataLogging();
    });

// Registering services and repositories
builder.Services.AddScoped<ClienteService>();
builder.Services.AddScoped<AvaliacaoService>();
builder.Services.AddScoped<PesquisasDocumentosService>();
builder.Services.AddScoped<ContratoService>();
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IAvaliacaoRepository, AvaliacaoRepository>();

var app = builder.Build();

// Enable Serilog request logging
app.UseSerilogRequestLogging();

// Health check endpoint for Kubernetes liveness and readiness probes
app.MapHealthChecks("healthz");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Enable OpenAPI JSON endpoint
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartFlowPJ API V1");
    });
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Accept routes with optional repeated /api prefixes (e.g., /api/foo and /api/api/foo).
app.Use(async (context, next) =>
{
    var path = context.Request.Path;
    while (path.StartsWithSegments("/api", out var remainder) && remainder.HasValue)
        path = remainder;

    context.Request.Path = path;
    await next();
});

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapSmartFlowPjLogin();

app.UseCors("AllowAny");

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // Exclude all checks, only return 200 OK if the app is running
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = registration => registration.Tags.Contains("ready") // Only include checks tagged with "ready"
});

app.MapControllers();

app.Run();
