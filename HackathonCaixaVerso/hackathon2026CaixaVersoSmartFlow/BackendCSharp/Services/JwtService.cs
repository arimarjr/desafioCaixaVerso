using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

// =============================================================================
// SERVIÇO JWT — Geração de access token (signed) e refresh token (opaque)
// =============================================================================

class JwtService : IJwtService
{
    private readonly SigningCredentials _signingCredentials;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int    _accessTokenMinutos;

    public JwtService(string secret, string issuer, string audience, int accessTokenMinutos)
    {
        if (secret.Length < 32)
            throw new InvalidOperationException("Jwt:Secret deve ter no mínimo 32 caracteres.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        _signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        _issuer             = issuer;
        _audience           = audience;
        _accessTokenMinutos = accessTokenMinutos;
    }

    public string GerarAccessToken(UsuarioMock usuario)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Matricula),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier,   usuario.Matricula),
            new Claim(ClaimTypes.Name,             usuario.Nome),
            new Claim(ClaimTypes.Role,             usuario.Perfil),
        };

        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(_accessTokenMinutos),
            signingCredentials: _signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Refresh token opaco: 64 bytes criptograficamente aleatórios em Base64
    public string GerarRefreshToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }
}
