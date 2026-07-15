using System.Text.Json;
using System.Text.RegularExpressions;

// =============================================================================
// SERVIÇO DE EMPRESAS — Carrega DataBase/cadastroEmpresas.json em memória
// no startup e disponibiliza busca O(1) por CNPJ.
// =============================================================================

class EmpresasService : IEmpresasService
{
    private readonly Dictionary<string, JsonElement> _idx =
        new(StringComparer.OrdinalIgnoreCase);

    public EmpresasService(string empresasPath)
    {
        if (!File.Exists(empresasPath)) return;

        var jsonText = File.ReadAllText(empresasPath);
        using var doc = JsonDocument.Parse(jsonText);
        var root = doc.RootElement;

        // Suporta tanto array raiz quanto objeto { "empresas": [...] }
        var arrayEl = root.ValueKind == JsonValueKind.Array
            ? root
            : root.TryGetProperty("empresas", out var emp2) ? emp2 : root;

        foreach (var emp in arrayEl.EnumerateArray())
        {
            if (emp.TryGetProperty("cadastroEmpresa", out var ce) &&
                ce.TryGetProperty("cnpj", out var cnpjProp))
            {
                var cnpjKey = Regex.Replace(cnpjProp.GetString() ?? "", @"\D", "");
                if (!string.IsNullOrEmpty(cnpjKey))
                    _idx[cnpjKey] = emp.Clone();
            }
        }
    }

    public JsonElement? BuscarPorCnpj(string cnpj)
    {
        var cnpjLimpo = Regex.Replace(cnpj, @"\D", "");
        return _idx.TryGetValue(cnpjLimpo, out var empresa) ? empresa : null;
    }
}
