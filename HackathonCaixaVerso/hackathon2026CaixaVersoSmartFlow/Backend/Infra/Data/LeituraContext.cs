using Microsoft.EntityFrameworkCore;

namespace Infra.Data;

public class LeituraContext(DbContextOptions<LeituraContext> options) : DbContextBase<LeituraContext>(options) { }
