using Microsoft.EntityFrameworkCore;

namespace Infra.Data;

public class EscritaContext(DbContextOptions<EscritaContext> options) : DbContextBase<EscritaContext>(options) { }
