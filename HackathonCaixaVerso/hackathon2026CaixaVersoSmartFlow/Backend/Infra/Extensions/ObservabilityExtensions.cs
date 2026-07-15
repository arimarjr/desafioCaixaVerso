using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
 
namespace Infra.Extensions;
 
public static class ObservabilityExtensions
{
    public static IServiceCollection AddObservability(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient();
        services.ConfigureHttpClientDefaults(http =>
        {
            http.AddStandardResilienceHandler();
        });
 
        services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService("SmartFlowPJ.Api"))
            .WithTracing(tracing =>
            {
                tracing
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddOtlpExporter(options => ConfigureOtlp(options, configuration));
            })
            .WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation()
                    .AddOtlpExporter(options => ConfigureOtlp(options, configuration));
            });
 
        return services;
    }
 
    public static ILoggingBuilder AddObservabilityLogging(this ILoggingBuilder logging, IConfiguration configuration)
    {
        logging.AddOpenTelemetry(options =>
        {
            options.IncludeFormattedMessage = true;
            options.IncludeScopes = true;
            options.ParseStateValues = true;
            options.AddOtlpExporter(exporterOptions => ConfigureOtlp(exporterOptions, configuration));
        });
 
        return logging;
    }
 
    private static void ConfigureOtlp(OtlpExporterOptions options, IConfiguration configuration)
    {
        var endpoint = configuration["OpenTelemetry:Otlp:Endpoint"];
        if (!string.IsNullOrWhiteSpace(endpoint))
            options.Endpoint = new Uri(endpoint);
 
        var protocol = configuration["OpenTelemetry:Otlp:Protocol"];
        if (string.Equals(protocol, "http/protobuf", StringComparison.OrdinalIgnoreCase))
            options.Protocol = OtlpExportProtocol.HttpProtobuf;
        else if (string.Equals(protocol, "grpc", StringComparison.OrdinalIgnoreCase))
            options.Protocol = OtlpExportProtocol.Grpc;
    }
}