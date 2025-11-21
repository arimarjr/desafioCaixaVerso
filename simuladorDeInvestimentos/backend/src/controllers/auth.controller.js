import * as authService from "../services/auth.service.js";

export async function login(req, res) {
  const { email, senha } = req.body;
  try {
    const result = await authService.login(email, senha);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}
