import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Headphones, KeyRound, Lock, LogIn, Mail, Send } from "lucide-react";
import Banner from "../../../shared/components/Banner/Banner";
import Field from "../../../shared/components/Field/Field";
import AuthModel from "../models/AuthModel";
import "./LoginCard.css";

function LoginCard({ controller }) {
  const { formData, fieldErrors, formError, showPassword, status, updateField, togglePasswordVisibility, submit } = controller;

  const [mode, setMode] = useState("login"); // "login" | "forgot-email" | "forgot-code"
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  const openForgotFlow = (e) => {
    e.preventDefault();
    setResetEmail(formData.email || "");
    setResetCode("");
    setNewPassword("");
    setResetError(null);
    setResetSuccess(null);
    setMode("forgot-email");
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    if (!resetEmail.trim()) {
      setResetError("Informe o e-mail da sua conta.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await AuthModel.requestPasswordReset(resetEmail.trim());
      setResetSuccess(res.mensagem || "Código enviado para o seu e-mail!");
      setMode("forgot-code");
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setResetError(null);
    if (!resetCode.trim() || resetCode.trim().length < 6) {
      setResetError("Informe o código de 6 dígitos enviado ao seu e-mail.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetError("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await AuthModel.resetPassword({
        email: resetEmail.trim(),
        codigo: resetCode.trim(),
        novaSenha: newPassword,
      });
      updateField("email", resetEmail.trim());
      updateField("password", "");
      setResetSuccess(res.mensagem || "Senha alterada com sucesso!");
      setMode("login");
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-card__header">
        <div className="login-card__logo" style={{ background: "none", boxShadow: "none", width: "60px", height: "60px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" style={{ width: "60px", height: "60px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0, 102, 178, 0.28)" }}>
            <defs>
              <linearGradient id="ht-login-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#0066B2"/>
                <stop offset="100%" stop-color="#005599"/>
              </linearGradient>
              <linearGradient id="ht-login-ticket" x1="16" y1="22" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FFFFFF"/>
                <stop offset="100%" stop-color="#E0F2FE"/>
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="16" fill="url(#ht-login-bg)"/>
            <rect x="2" y="2" width="60" height="60" rx="14" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.5"/>
            <path d="M16 31C16 21.6112 23.1634 14 32 14C40.8366 14 48 21.6112 48 31" stroke="#E0F2FE" strokeWidth="3.5" strokeLinecap="round"/>
            <rect x="12" y="28" width="6" height="12" rx="3" fill="#E0F2FE"/>
            <rect x="46" y="28" width="6" height="12" rx="3" fill="#E0F2FE"/>
            <path d="M20 25C20 23.3431 21.3431 22 23 22H41C42.6569 22 44 23.3431 44 25V31.5C42.067 31.5 40.5 33.067 40.5 35C40.5 36.933 42.067 38.5 44 38.5V45C44 46.6569 42.6569 48 41 48H23C21.3431 48 20 46.6569 20 45V38.5C21.933 38.5 23.5 36.933 23.5 35C23.5 33.067 21.933 31.5 20 31.5V25Z" fill="url(#ht-login-ticket)"/>
            <line x1="25" y1="29" x2="39" y2="29" stroke="#0066B2" strokeOpacity="0.35" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="2.5 3"/>
            <path d="M27.5 38L30.8 41.2L37 34.8" stroke="#0066B2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>HelpTicket</h1>
        <p>
          {mode === "login"
            ? "Suporte de TI simplificado"
            : mode === "forgot-email"
            ? "Recuperação de senha por e-mail"
            : "Digite o código enviado ao seu e-mail"}
        </p>
      </div>

      {mode === "forgot-email" ? (
        <form onSubmit={handleRequestCode} noValidate>
          <Banner>{resetError}</Banner>
          <Field
            id="reset-email"
            label="E-mail da conta"
            icon={Mail}
            type="email"
            placeholder="seu-email@dominio.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button
            type="submit"
            className={`login-submit ${resetLoading ? "login-submit--loading" : ""}`}
            disabled={resetLoading}
          >
            {resetLoading ? "Enviando código..." : "Enviar código por e-mail"}
            {!resetLoading && <Send size={15} />}
          </button>
          <div style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setResetError(null); setMode("login"); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--color-primary)" }}
            >
              <ArrowLeft size={14} /> Voltar para o login
            </a>
          </div>
        </form>
      ) : mode === "forgot-code" ? (
        <form onSubmit={handleConfirmReset} noValidate>
          {resetSuccess && (
            <div style={{
              marginBottom: "var(--space-3)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-success-light)",
              color: "var(--color-success-text)",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--weight-medium)",
            }}>
              {resetSuccess}
            </div>
          )}
          <Banner>{resetError}</Banner>
          <Field
            id="reset-code"
            label="Código de 6 dígitos"
            icon={KeyRound}
            type="text"
            placeholder="Ex: 482910"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
          />
          <Field
            id="reset-new-password"
            label="Nova Senha (mín. 6 caracteres)"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            rightSlot={
              <button
                type="button"
                className="login-password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <button
            type="submit"
            className={`login-submit ${resetLoading ? "login-submit--loading" : ""}`}
            disabled={resetLoading}
          >
            {resetLoading ? "Salvando..." : "Redefinir Senha"}
          </button>
          <div style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setResetError(null); setMode("forgot-email"); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", color: "var(--color-primary)" }}
            >
              <ArrowLeft size={14} /> Reenviar código / Trocar e-mail
            </a>
          </div>
        </form>
      ) : status === "success" ? (
        <div className="login-success">
          <div className="login-success__icon"><LogIn size={20} /></div>
          <h2>Login realizado</h2><p>Bem-vindo(a) de volta, {formData.email}</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          {resetSuccess && (
            <div style={{
              marginBottom: "var(--space-3)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-success-light)",
              color: "var(--color-success-text)",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--weight-medium)",
            }}>
              {resetSuccess}
            </div>
          )}
          <Banner>{formError}</Banner>
          <Field id="email" label="E-mail" icon={Mail} type="email" placeholder="usuario@empresa.com.br" value={formData.email} error={fieldErrors.email} onChange={(e) => updateField("email", e.target.value)} />
          <Field id="password" label="Senha" icon={Lock} type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} error={fieldErrors.password} onChange={(e) => updateField("password", e.target.value)}
            headerExtra={<a href="#" onClick={openForgotFlow}>Esqueci minha senha</a>}
            rightSlot={<button type="button" className="login-password-toggle" onClick={togglePasswordVisibility} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
          <button type="submit" className={`login-submit ${status === "loading" ? "login-submit--loading" : ""}`} disabled={status === "loading"}>{status === "loading" ? "Entrando..." : "Entrar"}{status !== "loading" && <LogIn size={15} />}</button>
        </form>
      )}
      <p className="login-card__footer">© 2026 HelpTicket TI. Todos os direitos reservados.</p>
    </div>
  );
}
export default LoginCard;
