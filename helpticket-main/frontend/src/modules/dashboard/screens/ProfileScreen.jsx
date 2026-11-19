import { useEffect, useState } from "react";
import { Save, User, Mail, Building } from "lucide-react";
import { Card, Button, Field, Avatar, Badge } from "../../../shared/components";
import { usuariosApi } from "../../../lib/api";
import "./ProfileScreen.css";

function ProfileScreen() {
  const stored = JSON.parse(localStorage.getItem("helpticket_user") || "{}");
  const [nome, setNome] = useState(stored.nome || "Usuário");
  const [email, setEmail] = useState(stored.email || "");
  const [tipo, setTipo] = useState(stored.tipoUsuario || "Solicitante");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    usuariosApi.obterMeuPerfil().then((u) => {
      setNome(u.nome);
      setEmail(u.email);
      setTipo(u.tipo);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const atualizado = await usuariosApi.atualizarMeuPerfil({
        nome,
        email,
        senhaAtual: senhaAtual || undefined,
        novaSenha: novaSenha || undefined,
      });
      localStorage.setItem("helpticket_user", JSON.stringify({
        ...stored,
        nome: atualizado.nome,
        email: atualizado.email,
      }));
      setSenhaAtual("");
      setNovaSenha("");
      setFeedback({ type: "success", text: "Perfil atualizado com sucesso!" });
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-screen">
      <div className="profile-screen__header">
        <Avatar name={nome} size="xl" status="online" />
        <div className="profile-screen__header-info">
          <h1 className="profile-screen__title">{nome}</h1>
          <p className="profile-screen__subtitle">
            HelpTicket <Badge tone="neutral" style={{marginLeft: '8px'}}>{tipo}</Badge>
          </p>
        </div>
      </div>

      <Card>
        <div className="profile-screen__section">
          <h2 className="profile-screen__section-title">Informações Pessoais</h2>
          {feedback && (
            <p style={{
              color: feedback.type === "error" ? "var(--color-error)" : "var(--color-success)",
              fontSize: "var(--text-sm)",
              marginBottom: "var(--space-3)"
            }}>
              {feedback.text}
            </p>
          )}
          <div className="profile-screen__grid-2">
            <Field 
              id="nome" 
              label="Nome Completo" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              icon={User} 
            />
            <Field 
              id="email" 
              label="E-mail" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail} 
            />
            <Field 
              id="departamento" 
              label="Perfil de Acesso" 
              value={tipo} 
              icon={Building} 
              disabled
            />
          </div>
        </div>

        <div className="profile-screen__section">
          <h2 className="profile-screen__section-title">Alterar Senha</h2>
          <div className="profile-screen__grid-2">
            <Field 
              id="senha-atual" 
              label="Senha Atual" 
              type="password" 
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="••••••••" 
            />
            <Field 
              id="nova-senha" 
              label="Nova Senha" 
              type="password" 
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="••••••••" 
            />
          </div>
        </div>
        
        <Card.Footer>
          <Button icon={Save} onClick={handleSave} loading={loading}>
            Salvar Alterações
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default ProfileScreen;
