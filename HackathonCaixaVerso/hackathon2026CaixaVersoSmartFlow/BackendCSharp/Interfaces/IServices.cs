using System.Text.Json;

// =============================================================================
// INTERFACES — Contratos de serviço da Plataforma PJ
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

interface IEmpresasService
{
    JsonElement? BuscarPorCnpj(string cnpj);
}

// =============================================================================
// INTERFACE — Upload de documentos de pesquisa
// =============================================================================

interface IPesquisasDocumentosService
{
    Task<PlataformaPJ.Models.UploadPesquisaDocumentoResponse> SalvarDocumentoAsync(
        string identificadorEmpresa,
        string pesquisaId,
        string nomePesquisa,
        IFormFile arquivo,
        CancellationToken cancellationToken);
}

// =============================================================================
// INTERFACE — Geração de contrato / CCB
// =============================================================================

interface IContratoService
{
    PlataformaPJ.Application.DTOs.GerarContratoResponse GerarContrato(
        PlataformaPJ.Application.DTOs.GerarContratoRequest request);
}

// =============================================================================
// INTERFACE — Persistência de avaliações de crédito
// =============================================================================

interface IAvaliacaoService
{
    ResultadoAvaliacao Salvar(SalvarAvaliacaoRequest request);
    IReadOnlyList<ResultadoAvaliacao> ListarTodas();
}
