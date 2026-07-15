// =============================================================================
// MODELOS / RECORDS — Plataforma PJ
// =============================================================================

record LoginRequest(string Matricula, string Senha);
record LoginResponse(string AccessToken, DateTime ExpiresAt, UsuarioInfo Usuario);
record UsuarioInfo(string Matricula, string Nome, string Perfil);
record UsuarioMock(string Matricula, string SenhaHash, string Nome, string Perfil);
record RefreshTokenEntry(string Matricula, DateTime Expiracao);

// =============================================================================
// MODELOS — Persistência de avaliações de crédito
// =============================================================================

record SalvarAvaliacaoRequest(
    string Cnpj,
    string RazaoSocial,
    string NomeFantasia,
    string Segmento,
    string PorteCaixa,
    string PorteEmpresa,
    string RatingBadge,
    bool   RatingAprovado,
    string LimiteGlobal,
    string FaturamentoAnual,
    string Nepj,
    string NepjClassificacao,
    string TempoRelacionamento,
    bool   PossuiRestricao
);

record ResultadoAvaliacao(
    string   Id,
    DateTime DataHoraAvaliacao,
    string   Cnpj,
    string   RazaoSocial,
    string   NomeFantasia,
    string   Segmento,
    string   PorteCaixa,
    string   PorteEmpresa,
    string   RatingBadge,
    bool     RatingAprovado,
    string   LimiteGlobal,
    string   FaturamentoAnual,
    string   Nepj,
    string   NepjClassificacao,
    string   TempoRelacionamento,
    bool     PossuiRestricao
);
