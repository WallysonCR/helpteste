import { API_BASE_URL } from "../../../config/api";

const AuthModel = {
  emptyState() { return { email: "", password: "" }; },
  validate({ email, password }) {
    const errors = {};
    if (!email.trim()) errors.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail valido.";
    if (!password) errors.password = "Informe sua senha.";
    else if (password.length < 6) errors.password = "A senha deve ter ao menos 6 caracteres.";
    return errors;
  },
  async authenticate({ email, password }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });
    if (!response.ok) {
      throw new Error(response.status === 401 ? "E-mail ou senha invalidos." : "Nao foi possivel entrar. Tente novamente.");
    }
    return response.json();
  },
  async requestPasswordReset(email) {
    const response = await fetch(`${API_BASE_URL}/api/auth/esqueci-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.mensagem || "Não foi possível enviar o código de recuperação.");
    }
    return data;
  },
  async resetPassword({ email, codigo, novaSenha }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/redefinir-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, codigo, novaSenha }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.mensagem || "Não foi possível redefinir a senha.");
    }
    return data;
  },
};
export default AuthModel;
