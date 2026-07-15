// =============================================================================
// SERVIÇO DE USUÁRIOS — Base mock com senhas hashadas (bcrypt + salt automático)
// Em produção: substituir por repositório com banco de dados.
//
// BcryptWorkFactor controla o custo do hash:
//   • Dev  → 4  (rápido, sem impacto na segurança local)
//   • Prod → 12 (lento o suficiente para dificultar força bruta)
// =============================================================================

class UsuarioService : IUsuarioService
{
    // Whitelist de usuários autorizados; senha inicial = matrícula.
    private readonly IReadOnlyList<UsuarioMock> _usuarios;

    public UsuarioService(int _ /* refreshTokenDias — reservado para expansão */, int bcryptWorkFactor = 12)
    {
        _usuarios = new List<UsuarioMock>
        {
            Criar("c128661", "Arimar Silva Soares Júnior",         "GERENTE_PJ", bcryptWorkFactor),
            Criar("c129435", "Viviene Arruda José",                "GERENTE_PJ", bcryptWorkFactor),
            Criar("c087327", "Rodrigo Francisco Bisol",            "GERENTE_PJ", bcryptWorkFactor),
            Criar("c128363", "Wendel Alves da Silva",              "GERENTE_PJ", bcryptWorkFactor),
            Criar("c137544", "Maria Regiane Silva dos Santos",     "GERENTE_PJ", bcryptWorkFactor),
            Criar("c148050", "Luciana de Matos Andrade",           "GERENTE_PJ", bcryptWorkFactor),
        }.AsReadOnly();
    }

    // Senha inicial = matrícula; hash com bcrypt usando work-factor configurável
    private static UsuarioMock Criar(string matricula, string nome, string perfil, int workFactor) =>
        new(matricula, BCrypt.Net.BCrypt.HashPassword(matricula, workFactor: workFactor), nome, perfil);

    public UsuarioMock? ValidarCredenciais(string matricula, string senha)
    {
        var usuario = _usuarios.FirstOrDefault(u =>
            string.Equals(u.Matricula, matricula, StringComparison.OrdinalIgnoreCase));

        if (usuario is null) return null;

        // BCrypt.Verify faz a comparação em tempo constante (evita timing attacks)
        return BCrypt.Net.BCrypt.Verify(senha, usuario.SenhaHash) ? usuario : null;
    }

    public UsuarioMock? BuscarPorMatricula(string matricula) =>
        _usuarios.FirstOrDefault(u =>
            string.Equals(u.Matricula, matricula, StringComparison.OrdinalIgnoreCase));
}
