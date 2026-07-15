// src/chartjs.mock.ts
// Mock do Chart.js para Karma + Angular 19
// Evita erros como: "line is not a registered controller"

export class Chart {
  constructor(_ctx?: any, _config?: any) {
    // objeto mínimo
    return {
      update: () => {},
      destroy: () => {},
      resize: () => {},
      config: _config
    };
  }

  // necessário para não quebrar ng2-charts e evitar TS2339
  static register(..._args: any[]): void {
    // no-op
  }
}

// registerables é usado por Chart.register(...registerables)
export const registerables: any[] = [];
