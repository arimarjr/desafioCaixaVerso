using System.Diagnostics.CodeAnalysis;
using Azure.Security.KeyVault.Secrets;

namespace Configuration;

public class AppSettings
{
    public static ConnectionStrings ConnectionStrings { get; set; } = null!;
    public static ServicesConfig ServicesConfig { get; set; } = null!;
    public static AppSettings Inicializar(IConfiguration configuration, SecretClient secretClient)
    {
        var appsettings = new AppSettings();
        configuration.Bind(appsettings);
        ConnectionStrings.Escrita = secretClient.GetSecret(ConnectionStrings.Escrita).Value.Value;
        ConnectionStrings.Leitura = secretClient.GetSecret(ConnectionStrings.Leitura).Value.Value;

        ServicesConfig.ApiKey = secretClient.GetSecret(ServicesConfig.ApiKey).Value.Value;
        ServicesConfig.Agent = secretClient.GetSecret(ServicesConfig.Agent).Value.Value;

        return appsettings;
    }
    
}