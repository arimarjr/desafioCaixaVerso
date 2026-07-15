import jwt from "jsonwebtoken";
import { SECRET } from "../services/auth.service.js";

export function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token não enviado" });
  }

  // Ex: "Bearer eyJhbGciOiJI..."
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.clienteId = payload.clienteId; // coloca ID no request
    next(); // permite seguir
  } catch (err) {
    return res.status(403).json({ message: "Token expirado ou inválido" });
  }
}
 