import jwt from "jsonwebtoken";

export const SECRET = "chave-secreta-simples";

// Usuário de demonstração
const usuarioFake = {
  email: "cliente@exemplo.com",
  senha: "123456",
  id: 123
};

export async function login(email, senha) {
  
  // valida email e senha
  if (email !== usuarioFake.email || senha !== usuarioFake.senha) {
    throw new Error("Credenciais inválidas");
  }

  // gera token
  const token = jwt.sign(
    { clienteId: usuarioFake.id },
    SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    clienteId: usuarioFake.id
  };
}
