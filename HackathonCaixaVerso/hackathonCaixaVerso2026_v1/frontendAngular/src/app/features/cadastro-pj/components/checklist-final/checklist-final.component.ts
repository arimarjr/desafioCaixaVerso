import {
  ChangeDetectionStrategy, Component, computed, Input, OnChanges, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresaVm, SocioVm } from '../../models/operacao-credito.vm';

export interface CheckItem {
  id: string;
  label: string;
  subtext?: string;
  checked: boolean;
}

export interface CheckSection {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  colorClass: string;
  expandida: boolean;
  items: CheckItem[];
}

@Component({
  selector: 'app-checklist-final',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './checklist-final.component.html',
  styleUrl: './checklist-final.component.scss',
})
export class ChecklistFinalComponent implements OnChanges {
  @Input() empresa: EmpresaVm | null = null;
  @Input() socios: SocioVm[] = [];
  @Input() avaliacaoFeita = false;

  readonly secoes = signal<CheckSection[]>([]);

  readonly totalItens = computed(() =>
    this.secoes().reduce((acc, s) => acc + s.items.length, 0)
  );

  readonly totalMarcados = computed(() =>
    this.secoes().reduce((acc, s) => acc + s.items.filter(i => i.checked).length, 0)
  );

  readonly percentualConcluido = computed(() => {
    const total = this.totalItens();
    return total === 0 ? 0 : Math.round((this.totalMarcados() / total) * 100);
  });

  ngOnChanges(): void {
    this.secoes.set(this._construirSecoes());
  }

  toggle(secaoId: string, itemId: string): void {
    this.secoes.update(secoes =>
      secoes.map(s =>
        s.id !== secaoId ? s : {
          ...s,
          items: s.items.map(i => i.id !== itemId ? i : { ...i, checked: !i.checked }),
        }
      )
    );
  }

  toggleSecao(secaoId: string): void {
    this.secoes.update(secoes =>
      secoes.map(s => s.id !== secaoId ? s : { ...s, expandida: !s.expandida })
    );
  }

  marcados(secao: CheckSection): number {
    return secao.items.filter(i => i.checked).length;
  }

  private _construirSecoes(): CheckSection[] {
    const empresaCarregada = this.empresa !== null;
    const avaliada = this.avaliacaoFeita;
    const socios = this.socios;

    const secoes: CheckSection[] = [
      // ── Documentos da Empresa ──────────────────────────────────────────────
      {
        id: 'docs-empresa',
        title: 'Documentos da Empresa',
        subtitle: 'Termo de Conferência de Documentos – MO 33301',
        icon: 'business',
        colorClass: 'sec-azul',
        expandida: true,
        items: [
          { id: 'cartao-cnpj',      label: 'Cartão CNPJ',                                                              checked: empresaCarregada },
          { id: 'qsa',              label: 'QSA',                                                                       checked: empresaCarregada },
          { id: 'contrato-social',  label: 'Contrato Social – Verificar a Última Alteração + QSA',                     checked: false },
          { id: 'certidao-teor',    label: 'Certidão de Inteiro Teor do Contrato Social',                              checked: false },
          { id: 'chancela',         label: 'Chancela Digital – Segunda Via do Contrato Social baixada do sistema',      checked: false },
          {
            id: 'faturamento',
            label: 'Faturamento – Extrato do Simples + DEFIS + Recibo de Pagamento ou ECF',
            subtext: 'Verificar páginas necessárias no CR015. Confirmar que o Ano da ECF está correto.',
            checked: false,
          },
          { id: 'qrcode-pronampe',  label: 'QR Code do compartilhamento (SE for Pronampe)',                            checked: false },
          { id: 'prints-sifec',     label: 'Prints Tela SIFEC e Cadastro com comprovação compartilhamento da receita', checked: false },
          { id: 'optante-simples',  label: 'Comprovação do Optante pelo Simples (Se for Simples)',                     checked: false },
        ],
      },

      // ── Pesquisas da Empresa ───────────────────────────────────────────────
      {
        id: 'pesq-empresa',
        title: 'Pesquisas da Empresa',
        icon: 'search',
        colorClass: 'sec-verde',
        expandida: true,
        items: [
          { id: 'sipes-pj',     label: 'Sipes',                                                                               checked: false },
          { id: 'cndt-pj',      label: 'CNDT – PJ (Certidão Negativa de Débitos Trabalhistas)',                               checked: false },
          { id: 'cnd-pj',       label: 'CND – PJ (Certidão de Débitos Tributários Federais e Dívida Ativa da União)',          checked: false },
          { id: 'crf-pj',       label: 'CRF – Certificado de Regularidade do FGTS',                                          checked: false },
          { id: 'jurir-pj',     label: 'Jurir',                                                                               checked: false },
          { id: 'trf2-pj',      label: 'TRF 2ª Região',                                                                     checked: false },
          { id: 'sintegra',     label: 'Sintegra',                                                                            checked: false },
          { id: 'contrapartes', label: 'Repetir mesma sequência para Contrapartes Conectadas – Conglomerado',                  checked: false },
        ],
      },

      // ── Documentos e Pesquisas por Sócio ──────────────────────────────────
      ...socios.map((socio, i): CheckSection => ({
        id: `docs-socio-${i}`,
        title: `Documentos dos Sócios – ${socio.nome}`,
        subtitle: `CPF: ${socio.cpf}`,
        icon: 'person',
        colorClass: 'sec-laranja',
        expandida: true,
        items: [
          { id: `id-cpf-${i}`,         label: 'Identidade + CPF',                              checked: false },
          { id: `id-conjuge-${i}`,      label: 'Identidade do cônjuge (se casado)',              checked: false },
          { id: `sicod-${i}`,           label: 'Sicod da Identidade ou CNH',                    checked: false },
          { id: `comp-res-${i}`,        label: 'Comprovante de Residência (máximo 60 dias)',     checked: false },
          { id: `ir-${i}`,              label: 'Imposto de Renda – Confirmado bens e direitos?', checked: false },
        ],
      })),

      ...socios.map((socio, i): CheckSection => ({
        id: `pesq-socio-${i}`,
        title: `Pesquisas dos Sócios – ${socio.nome}`,
        subtitle: `CPF: ${socio.cpf}`,
        icon: 'manage_search',
        colorClass: 'sec-roxo',
        expandida: true,
        items: [
          { id: `sipes-pf-${i}`,  label: 'Sipes',                                                   checked: false },
          { id: `reg-cpf-${i}`,   label: 'Regularidade CPF junto à Receita',                        checked: false },
          { id: `cndt-pf-${i}`,   label: 'CNDT/PF (Certidão Negativa de Débitos Trabalhistas)',     checked: false },
          { id: `cnd-pf-${i}`,    label: 'CND/PF (Certidão de Débitos Tributários Federais)',       checked: false },
          { id: `crf-pf-${i}`,    label: 'CRF – Certificado de Regularidade do FGTS',              checked: false },
          { id: `jurir-pf-${i}`,  label: 'Jurir',                                                   checked: false },
          { id: `trf2-pf-${i}`,   label: 'TRF 2ª Região',                                         checked: false },
          { id: `siric-pf-${i}`,  label: 'Pesquisa Externa SIRIC – do CPF',                        checked: false },
        ],
      })),

      // ── Avaliações + Pesquisas Completas SIRIC ────────────────────────────
      {
        id: 'avaliacoes',
        title: 'Avaliações + Pesquisas Completas SIRIC',
        icon: 'analytics',
        colorClass: 'sec-vermelho',
        expandida: true,
        items: [
          { id: 'aval-tomador',   label: 'Avaliação Tomador',                                                                         checked: avaliada },
          { id: 'avalops',        label: 'Avaliação de cada Operação – Avalops',                                                      checked: false },
          { id: 'siric-cnpj',     label: 'Pesquisa Externa SIRIC – do CNPJ',                                                         checked: avaliada },
          { id: 'parecer-conf',   label: 'Parecer Conformidade de cada operação',                                                     checked: false },
          { id: 'fichas-pj-mo',   label: 'Fichas PJ – MO 33045',                                                                     checked: false },
          { id: 'prop-segur',     label: 'Proposta Seguridade Assinada Digitalmente + Boleto, Comprovante e Aviso de Débito (se houver)', checked: false },
        ],
      },

      // ── Contratos e Formalização ──────────────────────────────────────────
      {
        id: 'contratos',
        title: 'Contratos e Formalização',
        subtitle: 'Última alteração: 30/01/2024',
        icon: 'description',
        colorClass: 'sec-cinza',
        expandida: true,
        items: [
          { id: 'faa',              label: 'FAA – se for conta nova',                              subtext: 'FAA Assinada Digitalizada',                              checked: false },
          { id: 'cont-relac',       label: 'Contrato de Relacionamento',                           subtext: 'Digitalizado Assinado',                                   checked: false },
          { id: 'form-ass-elet',    label: 'Formulário Assinatura Eletrônica',                     subtext: 'Digitalizado Assinado',                                   checked: false },
          { id: 'form-desbloqueio', label: 'Formulário Desbloqueio de Dispositivo',                subtext: 'Digitalizado Assinado',                                   checked: false },
          { id: 'form-sms',         label: 'Formulário SMS',                                       subtext: 'Digitalizado Assinado',                                   checked: false },
          { id: 'fichas-pj-2',      label: 'Fichas PJ – MO 33045',                                subtext: 'Digitalizado Assinado',                                   checked: false },
          { id: 'api-ibc',          label: 'API – Avaliação do Perfil do Investidor',              subtext: 'Feito no IBC',                                            checked: false },
          { id: 'termo-fundo',      label: 'Termo de Adesão ao Fundo de Investimento',             subtext: 'Assinado e Digitalizado na conta',                        checked: false },
          { id: 'ficha-siric-pf',   label: 'Ficha Cadastro SIRIC Pessoa Física',                  subtext: 'Digitalizado Assinado',                                   checked: false },
          { id: 'crot',             label: 'Contrato CROT',                                        subtext: 'Enviado no SICTD – CROT conforme e Implantado',            checked: false },
          { id: 'cont-operacao',    label: 'Contrato da Operação (Contrato do Empréstimo)',        subtext: 'Conforme',                                                checked: false },
          { id: 'cont-cartao',      label: 'Contrato Cartão de Crédito',                           subtext: 'Contratado – Cartão Entregue – Cartão Ativado',            checked: false },
          { id: 'cont-credenc',     label: 'Contrato Credenciamento',                              subtext: 'Credenciado / Máquina Pedida – Máquina entregue e Ativada', checked: false },
          { id: 'cont-vr',          label: 'Contrato VR',                                          subtext: 'Siali Cadastrado – Boleto Gerado – Boleto Pago',           checked: false },
          { id: 'email-confirm',    label: 'Confirmação por e-mail da solicitação de contratação do cliente',                                                           checked: false },
          { id: 'prestamista',      label: 'Digitalizar Contrato Prestamista para Operação 606',                                                                       checked: false },
          { id: 'licenc-ambiental', label: 'Licenciamento Ambiental – Caso precise',                                                                                   checked: false },
          { id: 'fotos-redes',      label: 'Fotos, Imagens Sites, Google Maps, Redes Sociais, Avaliações nas redes',                                                   checked: false },
          { id: 'cont-aluguel',     label: 'Contrato de Aluguel ou RGI do imóvel onde a empresa funciona',                                                             checked: false },
          { id: 'docs-patrimonio',  label: 'Documentos que comprovem Patrimônio da empresa ou dos Sócios', subtext: 'Veículos próprios da empresa ou sócios, imóveis etc.', checked: false },
          { id: 'comp-visita',      label: 'Comprovante Visita',                                                                                                       checked: false },
        ],
      },
    ];

    return secoes;
  }
}
