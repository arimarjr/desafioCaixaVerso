using Application.DTOs;
using Domain.Entities;

namespace Application.Mappers;

/// <summary>
/// Mapper para converter entidades de Cliente em respostas DTO. Centraliza a lógica de transformação de dados para garantir consistência e facilitar a manutenção. Cada método é responsável por mapear uma entidade ou coleção de entidades para o formato esperado pelas respostas da API.
/// </summary>
public static class ClienteMapper
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="cliente"></param>
    /// <returns></returns>
    public static ClienteResponse ToResponse(this Cliente cliente)
    {
        return new ClienteResponse
        {
            Id = cliente.Id,
            Cnpj = cliente.Cnpj.Value,
            RazaoSocial = cliente.RazaoSocial,
            NomeFantasia = cliente.NomeFantasia,
            CnaePrincipal = cliente.CnaePrincipal,
            DescricaoCnaePrincipal = cliente.DescricaoCnaePrincipal,
            NaturezaJuridica = cliente.NaturezaJuridica,
            PorteCaixa = cliente.PorteCaixa,
            RegimeTributario = cliente.RegimeTributario,
            DataConstituicao = cliente.DataConstituicao,
            TipoEmpresa = cliente.TipoEmpresa,
            DataDemonstracaoContabil = cliente.DataDemonstracaoContabil,
            DocumentoConstitutivo = cliente.DocumentoConstitutivo,
            DataUltimaAlteracao = cliente.DataUltimaAlteracao,
            CapitalSocial = cliente.CapitalSocial.Amount,
            RestricaoCadastral = cliente.RestricaoCadastral,
            Endereco = new EnderecoResponse
            {
                Cep = cliente.Endereco.Cep,
                Logradouro = cliente.Endereco.Logradouro,
                Numero = cliente.Endereco.Numero,
                Complemento = cliente.Endereco.Complemento,
                Bairro = cliente.Endereco.Bairro,
                Municipio = cliente.Endereco.Municipio,
                Uf = cliente.Endereco.Uf
            },
            TelefoneComercial = cliente.TelefoneComercial.Value,
            TelefoneCelular = cliente.TelefoneCelular.Value,
            EmailPrincipal = cliente.EmailPrincipal.Value,
            EmailFinanceiro = cliente.EmailFinanceiro.Value,
            Site = cliente.Site,
            TotalParticipacao = cliente.TotalParticipacao,
            FaturamentoQuantidadeMeses = cliente.FaturamentoQuantidadeMeses,
            FaturamentoCaracterizacao = cliente.FaturamentoCaracterizacao,
            FaturamentoValor = cliente.FaturamentoValor.Amount,
            FaturamentoMedioMensal = cliente.FaturamentoMedioMensal.Amount,
            FaturamentoDataAtualizacao = cliente.FaturamentoDataAtualizacao,
            FaturamentoOrigemDados = cliente.FaturamentoOrigemDados,
            PatrimonioPossui = cliente.PatrimonioPossui,
            PatrimonioValor = cliente.PatrimonioValor.Amount,
            PatrimonioDescricao = cliente.PatrimonioDescricao,
            PatrimonioDataAtualizacao = cliente.PatrimonioDataAtualizacao,
            AvaliacaoCreditoScoreInterno = cliente.AvaliacaoCreditoScoreInterno,
            AvaliacaoCreditoClassificacaoRisco = cliente.AvaliacaoCreditoClassificacaoRisco,
            AvaliacaoCreditoLimiteSugerido = cliente.AvaliacaoCreditoLimiteSugerido.Amount,
            AvaliacaoCreditoObservacao = cliente.AvaliacaoCreditoObservacao,
            Representantes = [.. cliente.Representantes.Select(r => new RepresentanteResponse
            {
                Id = r.Id,
                ClienteId = r.ClienteId,
                Perfil = r.Perfil,
                Cpf = r.Cpf,
                Nome = r.Nome,
                Funcao = r.Funcao,
                DataIngresso = r.DataIngresso,
                PercentualParticipacaoSocietaria = r.PercentualParticipacaoSocietaria,
                TipoParticipacao = r.TipoParticipacao,
                Telefone = r.Telefone.Value,
                Celular = r.Celular.Value,
                Email = r.Email.Value,
                Site = r.Site,
                Documentos = [.. r.Documentos.Select(d => new DocumentoRepresentanteResponse
                {
                    Id = d.Id,
                    RepresentanteId = d.RepresentanteId,
                    Tipo = d.Tipo,
                    Numero = d.Numero,
                    OrgaoEmissor = d.OrgaoEmissor,
                    DataEmissao = d.DataEmissao
                })]
            })],
            FaturamentoAnual = [.. cliente.FaturamentoAnual.Select(f => new FaturamentoAnualResponse
            {
                Id = f.Id,
                ClienteId = f.ClienteId,
                AnoReferencia = f.AnoReferencia,
                Caracterizacao = f.Caracterizacao,
                Valor = f.Valor.Amount,
                DataAtualizacao = f.DataAtualizacao,
                OrigemDados = f.OrigemDados,
                Comprovada = f.Comprovada.Amount
            })]
        };
    }
}
