import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import {
  validarCpf,
  validarCnpj,
  cpfValidator,
  cnpjValidator,
} from './document.validator';

// ─────────────────────────────────────────────────────────────────────────────
// validarCpf
// ─────────────────────────────────────────────────────────────────────────────
describe('validarCpf', () => {
  it('deve retornar true para CPF válido sem máscara', () => {
    expect(validarCpf('11144477735')).toBe(true);
  });

  it('deve retornar true para CPF válido com máscara', () => {
    expect(validarCpf('111.444.777-35')).toBe(true);
  });

  it('deve retornar false para CPF com todos os dígitos iguais', () => {
    expect(validarCpf('11111111111')).toBe(false);
    expect(validarCpf('00000000000')).toBe(false);
    expect(validarCpf('99999999999')).toBe(false);
  });

  it('deve retornar false para CPF com menos de 11 dígitos', () => {
    expect(validarCpf('1234567890')).toBe(false);
  });

  it('deve retornar false para CPF com mais de 11 dígitos', () => {
    expect(validarCpf('123456789012')).toBe(false);
  });

  it('deve retornar false para string vazia', () => {
    expect(validarCpf('')).toBe(false);
  });

  it('deve retornar false para CPF com dígito verificador inválido', () => {
    expect(validarCpf('11144477736')).toBe(false);
  });

  it('deve retornar false para CPF com caracteres não numéricos', () => {
    expect(validarCpf('abc.def.ghi-jk')).toBe(false);
  });

  it('deve retornar true para CPF onde primeiro dígito verificador tem rem=10 (deve zerar)', () => {
    // CPF 10000000108: rem1 = (12×10)%11 = 10 → 0; rem2 = 8 → 8 = dígito[10]
    expect(validarCpf('10000000108')).toBe(true);
  });

  it('deve retornar true para CPF onde segundo dígito verificador tem rem=10 (deve zerar)', () => {
    // CPF 60000000060: rem1 = 6; rem2 = (78×10)%11 = 10 → 0 = dígito[10]
    expect(validarCpf('60000000060')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validarCnpj
// ─────────────────────────────────────────────────────────────────────────────
describe('validarCnpj', () => {
  it('deve retornar true para CNPJ válido sem máscara', () => {
    expect(validarCnpj('11222333000181')).toBe(true);
  });

  it('deve retornar true para CNPJ válido com máscara', () => {
    expect(validarCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('deve retornar false para CNPJ com todos os dígitos iguais', () => {
    expect(validarCnpj('11111111111111')).toBe(false);
    expect(validarCnpj('00000000000000')).toBe(false);
  });

  it('deve retornar false para CNPJ com menos de 14 dígitos', () => {
    expect(validarCnpj('1122233300018')).toBe(false);
  });

  it('deve retornar false para CNPJ com mais de 14 dígitos', () => {
    expect(validarCnpj('112223330001811')).toBe(false);
  });

  it('deve retornar false para string vazia', () => {
    expect(validarCnpj('')).toBe(false);
  });

  it('deve retornar false para CNPJ com dígito verificador inválido', () => {
    expect(validarCnpj('11222333000182')).toBe(false);
  });

  it('deve retornar true para CNPJ onde r<2 no cálculo (r=0 → retorna 0)', () => {
    // Exercita branch r < 2 → return 0 no calc interno
    expect(validarCnpj('10000000010108')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// cpfValidator (ValidatorFn para Angular Reactive Forms)
// ─────────────────────────────────────────────────────────────────────────────
describe('cpfValidator', () => {
  let validator: ValidatorFn;

  beforeEach(() => {
    validator = cpfValidator();
  });

  it('deve retornar null para CPF válido', () => {
    const ctrl = new FormControl('11144477735');
    expect(validator(ctrl)).toBeNull();
  });

  it('deve retornar null para campo vazio (validação só ocorre se há valor)', () => {
    const ctrl = new FormControl('');
    expect(validator(ctrl)).toBeNull();
  });

  it('deve retornar null para valor null', () => {
    const ctrl = new FormControl(null);
    expect(validator(ctrl)).toBeNull();
  });

  it('deve retornar { cpfInvalid: true } para CPF inválido', () => {
    const ctrl = new FormControl('12345678901');
    expect(validator(ctrl)).toEqual({ cpfInvalid: true });
  });

  it('deve retornar { cpfInvalid: true } para dígitos repetidos', () => {
    const ctrl = new FormControl('11111111111');
    expect(validator(ctrl)).toEqual({ cpfInvalid: true });
  });

  it('deve aceitar CPF com máscara formatada', () => {
    const ctrl = new FormControl('111.444.777-35');
    expect(validator(ctrl)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// cnpjValidator (ValidatorFn para Angular Reactive Forms)
// ─────────────────────────────────────────────────────────────────────────────
describe('cnpjValidator', () => {
  let validator: ValidatorFn;

  beforeEach(() => {
    validator = cnpjValidator();
  });

  it('deve retornar null para CNPJ com 14 dígitos', () => {
    const ctrl = new FormControl('11222333000181');
    expect(validator(ctrl)).toBeNull();
  });

  it('deve retornar null para CNPJ formatado com máscara (14 dígitos após limpeza)', () => {
    const ctrl = new FormControl('11.222.333/0001-81');
    expect(validator(ctrl)).toBeNull();
  });

  it('deve retornar null para campo vazio', () => {
    const ctrl = new FormControl('');
    expect(validator(ctrl)).toBeNull();
  });

  it('deve retornar null para valor null', () => {
    const ctrl = new FormControl(null);
    expect(validator(ctrl)).toBeNull();
  });

  it('deve retornar { cnpjInvalid: true } para CNPJ com menos de 14 dígitos', () => {
    const ctrl = new FormControl('1122233300018');
    expect(validator(ctrl)).toEqual({ cnpjInvalid: true });
  });

  it('deve retornar { cnpjInvalid: true } para CNPJ com mais de 14 dígitos', () => {
    const ctrl = new FormControl('112223330001811');
    expect(validator(ctrl)).toEqual({ cnpjInvalid: true });
  });

  it('deve retornar { cnpjInvalid: true } para CNPJ com letras', () => {
    const ctrl = new FormControl('ABCDEFGHIJKLMN');
    expect(validator(ctrl)).toEqual({ cnpjInvalid: true });
  });
});
