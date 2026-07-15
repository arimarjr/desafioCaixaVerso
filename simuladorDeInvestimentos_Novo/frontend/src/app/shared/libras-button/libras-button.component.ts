
import { Component, HostListener, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibrasService } from '../../services/libras.service';

@Component({
  selector: 'app-libras-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './libras-button.component.html',
  styleUrls: ['./libras-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LibrasButtonComponent {
  private libras = inject(LibrasService);
  iconUrl = '';

  async ngOnInit() {
    // Resolve URL do ícone respeitando <base href> e sub-rotas
    this.iconUrl = new URL('icone-libras.jpg', document.baseURI).toString();

    // **Auto-init** VLibras ao carregar o componente (uma única vez)
    try {
      await this.libras.init();
    } catch (e) {
      console.error('Falha ao inicializar VLibras', e);
    }
  }

  /** Botão funciona como toggle do painel */
  onClick() {
    this.libras.togglePanel();
  }

  /** Teclado (Enter/Espaço) */
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onClick();
    }
  }
}
