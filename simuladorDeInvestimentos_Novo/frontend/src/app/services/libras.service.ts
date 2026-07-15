
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LibrasService {
  private scriptLoaded = false;
  private widgetInitialized = false;

  // Como o arquivo está em `public/`, ele é servido na raiz:
  // http://localhost:8080/vlibras-plugin.js
  private readonly localScriptUrl = '/vlibras-plugin.js';

  // Padrão oficial do VLibras para o widget (mantém compatibilidade).
  private readonly appUrl = 'https://vlibras.gov.br/app';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /** Insere o bloco de marcação exigido pelo VLibras. */
  private ensureMarkup() {
    if (this.document.querySelector('[vw]')) return;

    const wrapper = this.document.createElement('div');
    wrapper.setAttribute('vw', '');
    wrapper.className = 'enabled';

    const accessBtn = this.document.createElement('div');
    accessBtn.setAttribute('vw-access-button', '');
    accessBtn.className = 'active';

    const pluginWrapper = this.document.createElement('div');
    pluginWrapper.setAttribute('vw-plugin-wrapper', '');

    const topWrapper = this.document.createElement('div');
    topWrapper.className = 'vw-plugin-top-wrapper';

    pluginWrapper.appendChild(topWrapper);
    wrapper.appendChild(accessBtn);
    wrapper.appendChild(pluginWrapper);

    this.document.body.appendChild(wrapper);
  }

  /**
   * Inicializa: injeta markup, carrega script local e instancia o widget.
   * Chame no AppComponent (recomendado) ou em algum ponto único de bootstrap.
   */
  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.widgetInitialized) return;

    this.ensureMarkup();

    if (!this.scriptLoaded) {
      await new Promise<void>((resolve, reject) => {
        const script = this.document.createElement('script');
        script.src = this.localScriptUrl; // **script local**
        script.async = true;
        script.defer = true;

        script.onload = () => {
          this.scriptLoaded = true;
          resolve();
        };
        script.onerror = (err) => reject(err);

        this.document.body.appendChild(script);
      });
    }

    if (window.VLibras && typeof window.VLibras.Widget === 'function') {
      new window.VLibras.Widget(this.appUrl);
      this.widgetInitialized = true;
    } else {
      console.warn('VLibras não exposto em window. Verifique se o script local carregou.');
    }
  }

  /** Abre o painel via DOM */
  openPanel() {
    const btn =
      (this.document.querySelector('div[vw-access-button]') as HTMLElement) ||
      (this.document.querySelector('#vlibras .btn-access') as HTMLElement) ||
      (this.document.querySelector('.vpw-button') as HTMLElement);

    btn?.click();
  }

  /** Fecha o painel via DOM */
  closePanel() {
    const closeBtn =
      (this.document.querySelector('#vlibras .vpw-close') as HTMLElement) ||
      (this.document.querySelector('.vpw-close') as HTMLElement);

    closeBtn?.click();
  }

  /** Alterna abrir/fechar */
  togglePanel() {
    const panel =
      (this.document.querySelector('#vlibras') as HTMLElement) ||
      (this.document.querySelector('.vpw-wrapper') as HTMLElement);

    const isOpen = panel
      ? panel.classList.contains('active') || panel.style.display !== 'none'
      : false;

    if (isOpen) this.closePanel();
    else this.openPanel();
  }
}
