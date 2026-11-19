import { useEffect, useState } from "react";
import { Save, Send, Mail, KeyRound } from "lucide-react";
import { Card, Button, Select, Field, Badge } from "../../../shared/components";
import { configuracoesApi } from "../../../lib/api";
import "./SettingsScreen.css";

const DEFAULT_SETTINGS = {
  slaCriticaHoras: 4,
  slaAltaHoras: 12,
  expediente: "9-18",
  alertasEmailHabilitados: true,
  senderEmail: "",
  senderName: "HelpTicket Suporte",
  brevoApiKey: "",
};

function SettingsScreen() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [brevoConfigurado, setBrevoConfigurado] = useState(false);
  const [emailTeste, setEmailTeste] = useState("");
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    configuracoesApi
      .obter()
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          slaCriticaHoras: data.slaCriticaHoras ?? 4,
          slaAltaHoras: data.slaAltaHoras ?? 12,
          expediente: data.expediente ?? "9-18",
          alertasEmailHabilitados: data.alertasEmailHabilitados ?? true,
          senderEmail: data.senderEmail ?? "",
          senderName: data.senderName ?? "HelpTicket Suporte",
        }));
        setBrevoConfigurado(!!data.brevoConfigurado);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await configuracoesApi.salvar({
        slaCriticaHoras: Number(form.slaCriticaHoras) || 4,
        slaAltaHoras: Number(form.slaAltaHoras) || 12,
        expediente: form.expediente,
        alertasEmailHabilitados: form.alertasEmailHabilitados,
        senderEmail: form.senderEmail || undefined,
        senderName: form.senderName || undefined,
        brevoApiKey: form.brevoApiKey || undefined,
      });
      if (form.brevoApiKey) setBrevoConfigurado(true);
      setForm((prev) => ({ ...prev, brevoApiKey: "" }));
      setFeedback({ type: "success", text: "Configurações salvas com sucesso!" });
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDefaults = () => {
    setForm((prev) => ({
      ...DEFAULT_SETTINGS,
      senderEmail: prev.senderEmail,
    }));
    setFeedback({ type: "success", text: "Padrões de SLA restaurados. Clique em Salvar Configurações para confirmar." });
  };

  const handleTestEmail = async () => {
    if (!emailTeste.trim()) return;
    setTestingEmail(true);
    setFeedback(null);
    try {
      const res = await configuracoesApi.testarEmail(emailTeste.trim());
      setFeedback({ type: "success", text: res.mensagem || "E-mail de teste enviado!" });
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="settings-screen">
      <header className="settings-screen__header">
        <h1 className="settings-screen__title">Configurações do Sistema</h1>
        <p className="settings-screen__subtitle">Ajustes globais, parâmetros de SLA e integração de e-mail via Brevo.</p>
      </header>

      <Card>
        {feedback && (
          <div
            style={{
              padding: "var(--space-3) var(--space-5)",
              background: feedback.type === "error" ? "var(--color-error-light)" : "var(--color-success-light)",
              color: feedback.type === "error" ? "var(--color-error-text)" : "var(--color-success-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--weight-medium)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {feedback.text}
          </div>
        )}

        <div className="settings-group">
          <h2 className="settings-group__title">Parâmetros de SLA Globais</h2>
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">SLA Prioridade Crítica</span>
              <span className="settings-row__desc">Tempo máximo de resolução em horas</span>
            </div>
            <div style={{ width: "120px" }}>
              <Field
                id="sla_crit"
                value={form.slaCriticaHoras}
                onChange={(e) => setForm((p) => ({ ...p, slaCriticaHoras: e.target.value }))}
                type="number"
              />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">SLA Prioridade Alta</span>
              <span className="settings-row__desc">Tempo máximo de resolução em horas</span>
            </div>
            <div style={{ width: "120px" }}>
              <Field
                id="sla_alta"
                value={form.slaAltaHoras}
                onChange={(e) => setForm((p) => ({ ...p, slaAltaHoras: e.target.value }))}
                type="number"
              />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Expediente (Horário Comercial)</span>
              <span className="settings-row__desc">Considerar apenas este horário para contagem</span>
            </div>
            <div style={{ width: "200px" }}>
              <Select
                id="expediente"
                value={form.expediente}
                onChange={(e) => setForm((p) => ({ ...p, expediente: e.target.value }))}
                options={[
                  { value: "9-18", label: "09:00 às 18:00" },
                  { value: "8-17", label: "08:00 às 17:00" },
                  { value: "24x7", label: "24x7 (Ininterrupto)" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="settings-group">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
            <h2 className="settings-group__title" style={{ marginBottom: 0 }}>Integrações & Alertas (Brevo SMTP API)</h2>
            <Badge tone={brevoConfigurado ? "success" : "warning"} dot>
              {brevoConfigurado ? "Brevo Conectado" : "Aguardando API Key"}
            </Badge>
          </div>

          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Alertas por E-mail</span>
              <span className="settings-row__desc">Notificar usuários na mudança de status, atribuição e novas respostas</span>
            </div>
            <div style={{ width: "160px" }}>
              <Select
                id="email_alerts"
                value={form.alertasEmailHabilitados ? "sim" : "nao"}
                onChange={(e) => setForm((p) => ({ ...p, alertasEmailHabilitados: e.target.value === "sim" }))}
                options={[
                  { value: "sim", label: "Habilitado" },
                  { value: "nao", label: "Desabilitado" },
                ]}
              />
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">E-mail Remetente (Verificado no Brevo)</span>
              <span className="settings-row__desc">E-mail cadastrado em Senders & Domains na sua conta Brevo</span>
            </div>
            <div style={{ width: "280px" }}>
              <Field
                id="brevo_sender"
                type="email"
                icon={Mail}
                placeholder="seu-email@dominio.com"
                value={form.senderEmail}
                onChange={(e) => setForm((p) => ({ ...p, senderEmail: e.target.value }))}
              />
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Brevo API Key (xkeysib-...)</span>
              <span className="settings-row__desc">
                {brevoConfigurado
                  ? "Chave já configurada. Preencha apenas se desejar substituir."
                  : "Cole sua chave de API v3 do Brevo (ou configure Brevo__ApiKey no Render)"}
              </span>
            </div>
            <div style={{ width: "280px" }}>
              <Field
                id="brevo_key"
                type="password"
                icon={KeyRound}
                placeholder={brevoConfigurado ? "••••••••••••••••" : "xkeysib-..."}
                value={form.brevoApiKey}
                onChange={(e) => setForm((p) => ({ ...p, brevoApiKey: e.target.value }))}
              />
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Disparar E-mail de Teste</span>
              <span className="settings-row__desc">Salve as configurações acima e envie um e-mail real para testar</span>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", width: "360px" }}>
              <div style={{ flex: 1 }}>
                <Field
                  id="test_email"
                  type="email"
                  placeholder="destino@email.com"
                  value={emailTeste}
                  onChange={(e) => setEmailTeste(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                icon={Send}
                loading={testingEmail}
                disabled={!emailTeste.trim()}
                onClick={handleTestEmail}
                style={{ marginBottom: "var(--space-4)" }}
              >
                Testar
              </Button>
            </div>
          </div>
        </div>

        <Card.Footer>
          <Button variant="ghost" onClick={handleRestoreDefaults}>Restaurar Padrões</Button>
          <Button icon={Save} onClick={handleSave} loading={loading}>
            Salvar Configurações
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default SettingsScreen;
