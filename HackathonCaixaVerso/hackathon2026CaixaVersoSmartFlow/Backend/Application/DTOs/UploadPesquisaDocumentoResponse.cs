namespace Application.DTOs;

/// <summary>
/// Resposta para upload de documento de pesquisa. Contém informações sobre o resultado do upload, nome do arquivo salvo, caminho relativo, etc.
/// </summary>
public sealed class UploadPesquisaDocumentoResponse
{
    public bool   Sucesso           { get; set; }
    public string Mensagem          { get; set; } = string.Empty;
    public string Identificador     { get; set; } = string.Empty;
    public string PesquisaId        { get; set; } = string.Empty;
    public string NomeOriginal      { get; set; } = string.Empty;
    public string NomeSalvo         { get; set; } = string.Empty;
    public string CaminhoRelativo   { get; set; } = string.Empty;
}
