namespace PlataformaPJ.Models;

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
