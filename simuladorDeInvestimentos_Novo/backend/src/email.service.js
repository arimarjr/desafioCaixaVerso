import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis do .env

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmailContato(dados) {
  try {
    const email = await resend.emails.send({
      from: "noreply@seudominio.com", // pode ser qualquer email válido de teste
      to: "arimarjr@hotmail.com",     // destinatário fixo
      subject: "Novo contato do simulador",
      html: `
        <h2>Contato recebido</h2>
        <p><b>Nome:</b> ${dados.nome}</p>
        <p><b>Email:</b> ${dados.email}</p>
        <p><b>Telefone:</b> ${dados.telefone}</p>
        <p><b>Patrimônio:</b> R$ ${dados.patrimonio}</p>
        <p><b>Valor Inicial:</b> R$ ${dados.valorInicial ?? '-'}</p>
        <p><b>Respostas do questionário:</b> ${JSON.stringify(dados.respostas)}</p>
      `
    });

    console.log("Email enviado com sucesso!", email.id);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}
