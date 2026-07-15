// ViewModels — o que as telas precisam (nunca DTO cru na UI)

export interface UsuarioSessaoVm {
  matricula: string;
  nome: string;
  nomeAbreviado: string; // primeiro + último nome
  perfil: string;
  expiresAt: Date;
}
