import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import contatoRoutes from "./routes/contato.routes.js";
import perfilRoutes from "./routes/perfil-risco.routes.js";
import investimentosRoutes from "./routes/investimentos.routes.js";
import produtosRoutes from "./routes/produtos.routes.js";
import simulacaoRoutes from "./routes/simulacao.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Simulador de Investimentos está rodando! 🚀");
});

// rotas
app.use("/perfil-risco", perfilRoutes);
app.use("/investimentos", investimentosRoutes);
app.use("/produtos-recomendados", produtosRoutes);
app.use("/simular-investimento", simulacaoRoutes);
app.use("/autenticacao", authRoutes);
app.use("/contato-gerente", contatoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
