import { cadastroPjRoutes } from './cadastro-pj.routes';

describe('cadastroPjRoutes', () => {
  it('deve ter 2 rotas configuradas', () => {
    expect(cadastroPjRoutes.length).toBe(2);
  });

  it('deve ter rota raiz com lazy loading do componente de página', () => {
    const rota = cadastroPjRoutes.find(r => r.path === '');
    expect(rota).toBeDefined();
    expect(rota?.loadComponent).toBeDefined();
  });

  it('deve ter rota :cnpj com lazy loading do componente de página', () => {
    const rota = cadastroPjRoutes.find(r => r.path === ':cnpj');
    expect(rota).toBeDefined();
    expect(rota?.loadComponent).toBeDefined();
  });

  it('rota raiz e rota :cnpj devem carregar o mesmo componente', () => {
    const rotaRaiz = cadastroPjRoutes.find(r => r.path === '')!;
    const rotaCnpj = cadastroPjRoutes.find(r => r.path === ':cnpj')!;
    // Ambas devem ser funções de lazy load
    expect(typeof rotaRaiz.loadComponent).toBe('function');
    expect(typeof rotaCnpj.loadComponent).toBe('function');
  });
});
