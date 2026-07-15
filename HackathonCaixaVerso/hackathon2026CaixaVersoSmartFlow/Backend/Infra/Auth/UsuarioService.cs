namespace Infra.Auth;

using System.Security.Cryptography;
using System.Text;

public sealed class UsuarioService
{
    // Whitelist inicial de usuários autorizados.
    // Senhas são hashadas com PBKDF2 (RFC 2898) na inicialização.
    // Senha inicial = matrícula (ex.: c128661 → senha "c128661")
    private readonly IReadOnlyList<Usuario> _usuarios;
    
    // Parâmetros para PBKDF2
    private const int SaltSize = 16; // 128 bits
    private const int HashSize = 32; // 256 bits
    private const int Iterations = 100000;

    public UsuarioService() => _usuarios = new List<Usuario>
        {
            Criar("c128661", "Arimar Silva Soares Júnior",         "GERENTE_PJ"),
            Criar("c129435", "Viviene Arruda José",                "GERENTE_PJ"),
            Criar("c087327", "Rodrigo Francisco Bisol",            "GERENTE_PJ"),
            Criar("c128363", "Wendel Alves da Silva",              "GERENTE_PJ"),
            Criar("c137544", "Maria Regiane Silva dos Santos",     "GERENTE_PJ"),
            Criar("c148050", "Luciana de Matos Andrade",           "GERENTE_PJ"),
        }.AsReadOnly();

    // Senha inicial = matrícula; hash com PBKDF2-SHA256 com 100.000 iterações
    private static Usuario Criar(string matricula, string nome, string perfil) =>
        new(matricula, HashPassword(matricula), nome, perfil);

    public Usuario? ValidarCredenciais(string matricula, string senha)
    {
        var usuario = _usuarios.FirstOrDefault(u =>
            string.Equals(u.Matricula, matricula, StringComparison.OrdinalIgnoreCase));

        if (usuario is null) return null;

        // VerifyPassword faz a comparação em tempo constante (evita timing attacks)
        return VerifyPassword(senha, usuario.SenhaHash) ? usuario : null;
    }

    public Usuario? BuscarPorMatricula(string matricula) =>
        _usuarios.FirstOrDefault(u =>
            string.Equals(u.Matricula, matricula, StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Gera hash de senha usando PBKDF2-SHA256 com salt aleatório.
    /// Retorna: Base64(salt + hash)
    /// </summary>
    private static string HashPassword(string senha)
    {
        using (var rng = RandomNumberGenerator.Create())
        {
            byte[] salt = new byte[SaltSize];
            rng.GetBytes(salt);

            using (var pbkdf2 = new Rfc2898DeriveBytes(senha, salt, Iterations, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(HashSize);
                
                // Combina salt + hash para armazenamento
                byte[] result = new byte[SaltSize + HashSize];
                Buffer.BlockCopy(salt, 0, result, 0, SaltSize);
                Buffer.BlockCopy(hash, 0, result, SaltSize, HashSize);
                
                return Convert.ToBase64String(result);
            }
        }
    }

    /// <summary>
    /// Verifica se a senha fornecida corresponde ao hash armazenado.
    /// </summary>
    private static bool VerifyPassword(string senha, string senhaHash)
    {
        try
        {
            byte[] hashBytes = Convert.FromBase64String(senhaHash);
            
            if (hashBytes.Length != SaltSize + HashSize)
                return false;

            byte[] salt = new byte[SaltSize];
            Buffer.BlockCopy(hashBytes, 0, salt, 0, SaltSize);

            using (var pbkdf2 = new Rfc2898DeriveBytes(senha, salt, Iterations, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(HashSize);
                
                // Comparação em tempo constante usando SequenceEqual
                byte[] storedHash = new byte[HashSize];
                Buffer.BlockCopy(hashBytes, SaltSize, storedHash, 0, HashSize);
                
                return CryptographicOperations.FixedTimeEquals(hash, storedHash);
            }
        }
        catch
        {
            return false;
        }
    }
}
