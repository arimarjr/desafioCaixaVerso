using Domain.Entities;
using Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Infra.Data;
public abstract class DbContextBase<T>(DbContextOptions options) : DbContext(options) 
    where T : DbContext
{
    public virtual DbSet<Cliente> Cliente { get; set; }
    public virtual DbSet<Representante> Representante { get; set; }
    public virtual DbSet<DocumentoRepresentante> DocumentoRepresentante { get; set; }
    public virtual DbSet<FaturamentoAnual> FaturamentoAnual { get; set; }
    public virtual DbSet<Avaliacao> Avaliacao { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var cnpjConverter = new ValueConverter<Cnpj, string>(
            v => v.Value,
            s => Cnpj.Create(s).Value);

        var emailConverter = new ValueConverter<Email, string>(
            v => v.Value,
            s => Email.Create(s).Value);

        var telefoneConverter = new ValueConverter<Telefone, string>(
            v => v.Value,
            s => Telefone.Create(s).Value);

        var moneyConverter = new ValueConverter<Money, decimal>(
            v => v.Amount,
            s => Money.Create(s, Money.DefaultCurrency).Value);


        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.Id)
                .IsClustered(false);

            entity.Property(e => e.Cnpj)
                .HasConversion(cnpjConverter)
                .IsRequired()
                .HasMaxLength(14);

            entity.HasIndex(e => e.Cnpj)
                .IsUnique()
                .HasFillFactor(100);

            entity.Property(e => e.RazaoSocial)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.NomeFantasia)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.CnaePrincipal)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.DescricaoCnaePrincipal)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.NaturezaJuridica)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.PorteCaixa)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.RegimeTributario)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.DocumentoConstitutivo)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.TipoEmpresa)
                .IsRequired()
                .HasMaxLength(255);

            entity.ComplexProperty(e => e.Endereco, end =>
            {
                end.Property(p => p.Cep)
                    .HasColumnName("EnderecoCep")
                    .HasMaxLength(8);
                end.Property(p => p.Logradouro)
                    .HasColumnName("EnderecoLogradouro")
                    .HasMaxLength(255);
                end.Property(p => p.Numero)
                    .HasColumnName("EnderecoNumero")
                    .HasMaxLength(20);
                end.Property(p => p.Complemento)
                    .HasColumnName("EnderecoComplemento")
                    .HasMaxLength(255);
                end.Property(p => p.Bairro)
                    .HasColumnName("EnderecoBairro")
                    .HasMaxLength(120);
                end.Property(p => p.Municipio)
                    .HasColumnName("EnderecoMunicipio")
                    .HasMaxLength(120);
                end.Property(p => p.Uf)
                    .HasColumnName("EnderecoUf")
                    .HasMaxLength(2);
            });

            entity.Property(e => e.EmailPrincipal)
                .HasConversion(emailConverter)
                .HasMaxLength(255);
            
            entity.Property(e => e.EmailFinanceiro)
                .HasConversion(emailConverter)
                .HasMaxLength(255);
            
            entity.Property(e => e.TelefoneComercial)
                .HasConversion(telefoneConverter)
                .HasMaxLength(20);

            entity.Property(e => e.TelefoneCelular)
                .HasConversion(telefoneConverter)
                .HasMaxLength(20);

            entity.Property(e => e.Site)
                .HasMaxLength(255);

            entity.Property(e => e.FaturamentoOrigemDados)
                .HasMaxLength(255);

            entity.Property(e => e.AvaliacaoCreditoClassificacaoRisco)
                .HasMaxLength(50);

            entity.Property(e => e.AvaliacaoCreditoObservacao)
                .HasMaxLength(255);

            entity.Property(e => e.PatrimonioDescricao)
                .HasMaxLength(255);

            entity.Property(e => e.CapitalSocial)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

            entity.Property(e => e.FaturamentoValor)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

            entity.Property(e => e.FaturamentoMedioMensal)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

            entity.Property(e => e.PatrimonioValor)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

            entity.Property(e => e.AvaliacaoCreditoLimiteSugerido)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

        });

        modelBuilder.Entity<Representante>(entity =>
        {
            entity.HasKey(e => e.Id)
                .IsClustered(false);

            entity.HasIndex(e => e.Cpf)
                .IsUnique()
                .HasFillFactor(100);

            entity.Property(e => e.Perfil)
                .HasMaxLength(255);

            entity.Property(e => e.Nome)
                .HasMaxLength(255);
            
            entity.Property(e => e.Funcao)
                .HasMaxLength(255);

            entity.Property(e => e.TipoParticipacao)
                .HasMaxLength(255);

            entity.Property(e => e.Site)
                .HasMaxLength(255);

            entity.Property(e => e.Email)
                .HasConversion(emailConverter)
                .HasMaxLength(255);
            
            entity.Property(e => e.Telefone)
                .HasConversion(telefoneConverter)
                .HasMaxLength(20);

            entity.Property(e => e.Celular)
                .HasConversion(telefoneConverter)
                .HasMaxLength(20);

            entity.HasOne<Cliente>()
                .WithMany(c => c.Representantes)
                .HasForeignKey(r => r.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<DocumentoRepresentante>(entity =>
        {
            entity.HasKey(e => e.Id)
                .IsClustered(false);

            entity.Property(e => e.Tipo)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Numero)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.OrgaoEmissor)
                .IsRequired()
                .HasMaxLength(255);

            entity.HasOne<Representante>()
                .WithMany(r => r.Documentos)
                .HasForeignKey(d => d.RepresentanteId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<FaturamentoAnual>(entity =>
        {
            entity.HasKey(e => e.Id)
                .IsClustered(false);

            entity.Property(e => e.Valor)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

            entity.Property(e => e.Comprovada)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

            entity.Property(e => e.Caracterizacao)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.OrigemDados)
                .HasMaxLength(255);

            entity.HasOne<Cliente>()
                .WithMany(c => c.FaturamentoAnual)
                .HasForeignKey(f => f.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Avaliacao>(entity =>
        {
            entity.HasKey(e => e.Id)
                .IsClustered(false);

            entity.Property(e => e.Cnpj)
                .HasConversion(cnpjConverter)
                .IsRequired()
                .HasMaxLength(14);

            entity.HasIndex(e => e.Cnpj)
                .IsUnique()
                .HasFillFactor(100);

            entity.Property(e => e.RazaoSocial)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.NomeFantasia)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Segmento)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.PorteCaixa)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.PorteEmpresa)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.RatingBadge)
                .IsRequired()
                .HasMaxLength(10);

            entity.Property(e => e.Nepj)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.NepjClassificacao)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.TempoRelacionamento)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(e => e.LimiteGlobal)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

            entity.Property(e => e.FaturamentoAnual)
                .HasConversion(moneyConverter)
                .HasPrecision(18, 2);

            entity.HasOne<Cliente>()
                .WithMany(c => c.Avaliacao)
                .HasForeignKey(f => f.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

    }
}