using System.Text;
using System.Text.RegularExpressions;
using Application.DTOs;
using Infra.Options;
using Microsoft.Extensions.Options;

namespace Application.Services;

public sealed class PesquisasDocumentosService(
    IOptions<ArquivosDocumentosOptions> options,
    ILogger<PesquisasDocumentosService> logger)
{
    private readonly ArquivosDocumentosOptions _options = options.Value;
    private readonly ILogger<PesquisasDocumentosService> _logger = logger;

    private const long TamanhoMaximoBytes = 20 * 1024 * 1024; // 20 MB

    public async Task<UploadPesquisaDocumentoResponse> SalvarDocumentoAsync(
        string identificadorEmpresa,
        string pesquisaId,
        string nomePesquisa,
        IFormFile arquivo,
        CancellationToken cancellationToken)
    {
        if (arquivo is null || arquivo.Length == 0)
            throw new InvalidOperationException("Arquivo PDF não informado.");

        if (arquivo.Length > TamanhoMaximoBytes)
            throw new InvalidOperationException("Arquivo excede o tamanho máximo de 20 MB.");

        if (!EhPdfValido(arquivo))
            throw new InvalidOperationException("Somente arquivos PDF são permitidos.");

        var identificadorSeguro  = NormalizarNome(identificadorEmpresa, "EMPRESA-SEM-IDENTIFICADOR");
        var pesquisaIdSeguro     = NormalizarNome(pesquisaId,            "PESQUISA");
        var nomePesquisaSeguro   = NormalizarNome(nomePesquisa,          "PESQUISA");

        var diretorioEmpresa = Path.Combine(_options.DiretorioBase, identificadorSeguro);
        Directory.CreateDirectory(diretorioEmpresa);

        var dataHora       = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        var nomeArquivo    = $"{dataHora}_{pesquisaIdSeguro}_{nomePesquisaSeguro}.pdf";
        var caminhoCompleto = Path.Combine(diretorioEmpresa, nomeArquivo);

        await using var stream = new FileStream(
            caminhoCompleto,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None);

        await arquivo.CopyToAsync(stream, cancellationToken);

        _logger.LogInformation(
            "Documento salvo. Empresa: {Empresa} | Pesquisa: {Pesquisa} | Arquivo: {Arquivo}",
            identificadorSeguro, pesquisaIdSeguro, nomeArquivo);

        return new UploadPesquisaDocumentoResponse
        {
            Sucesso          = true,
            Mensagem         = "Documento salvo com sucesso.",
            Identificador    = identificadorSeguro,
            PesquisaId       = pesquisaIdSeguro,
            NomeOriginal     = arquivo.FileName,
            NomeSalvo        = nomeArquivo,
            CaminhoRelativo  = Path.Combine(identificadorSeguro, nomeArquivo),
        };
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static bool EhPdfValido(IFormFile arquivo)
    {
        var extensao = Path.GetExtension(arquivo.FileName);
        return string.Equals(extensao, ".pdf", StringComparison.OrdinalIgnoreCase)
            && string.Equals(arquivo.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizarNome(string valor, string fallback)
    {
        if (string.IsNullOrWhiteSpace(valor)) return fallback;

        var s = RemoverAcentos(valor.Trim().ToUpperInvariant());
        s = Regex.Replace(s, @"[^A-Z0-9\-_]", "-");
        s = Regex.Replace(s, "-{2,}", "-");
        return s.Trim('-');
    }

    private static string RemoverAcentos(string texto)
    {
        var normalizado = texto.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalizado.Length);
        foreach (var c in normalizado)
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c)
                != System.Globalization.UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}
