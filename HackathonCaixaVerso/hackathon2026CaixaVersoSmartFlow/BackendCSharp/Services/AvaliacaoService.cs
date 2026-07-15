using System.Text.Json;
using System.Text.Json.Serialization;

// =============================================================================
// SERVIÇO — Persistência de avaliações de crédito em JSON
// Singleton: compartilha lock para acesso thread-safe ao arquivo.
// =============================================================================

class AvaliacaoService : IAvaliacaoService
{
    private readonly string _caminho;
    private readonly object _lock = new();

    private static readonly JsonSerializerOptions _jsonOpts = new()
    {
        WriteIndented        = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public AvaliacaoService(string caminho)
    {
        _caminho = caminho;

        // Garante que o arquivo existe mesmo que não tenha sido criado manualmente
        if (!File.Exists(caminho))
            File.WriteAllText(caminho, "[]");
    }

    public ResultadoAvaliacao Salvar(SalvarAvaliacaoRequest req)
    {
        lock (_lock)
        {
            var lista = _lerLista();

            var novo = new ResultadoAvaliacao(
                Id:                 Guid.NewGuid().ToString("N"),
                DataHoraAvaliacao:  DateTime.UtcNow,
                Cnpj:               req.Cnpj,
                RazaoSocial:        req.RazaoSocial,
                NomeFantasia:       req.NomeFantasia,
                Segmento:           req.Segmento,
                PorteCaixa:         req.PorteCaixa,
                PorteEmpresa:       req.PorteEmpresa,
                RatingBadge:        req.RatingBadge,
                RatingAprovado:     req.RatingAprovado,
                LimiteGlobal:       req.LimiteGlobal,
                FaturamentoAnual:   req.FaturamentoAnual,
                Nepj:               req.Nepj,
                NepjClassificacao:  req.NepjClassificacao,
                TempoRelacionamento: req.TempoRelacionamento,
                PossuiRestricao:    req.PossuiRestricao
            );

            lista.Add(novo);
            File.WriteAllText(_caminho, JsonSerializer.Serialize(lista, _jsonOpts));

            return novo;
        }
    }

    public IReadOnlyList<ResultadoAvaliacao> ListarTodas()
    {
        lock (_lock)
        {
            return _lerLista().AsReadOnly();
        }
    }

    private List<ResultadoAvaliacao> _lerLista()
    {
        var json = File.ReadAllText(_caminho);
        return JsonSerializer.Deserialize<List<ResultadoAvaliacao>>(json, _jsonOpts) ?? [];
    }
}
