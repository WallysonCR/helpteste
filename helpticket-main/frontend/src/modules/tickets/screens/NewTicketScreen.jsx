import { useState } from "react";
import { Send, Tag, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Field, Select, Textarea, FileUpload } from "../../../shared/components";
import { ticketsApi } from "../../../lib/api";
import { uploadAnexos } from "../../../lib/storage";
import "./NewTicketScreen.css";

const CATEGORIAS = [
  { value: 1, label: "Hardware" },
  { value: 2, label: "Software" },
  { value: 3, label: "Rede" },
];

const PRIORIDADES = [
  { value: "Baixa", label: "Baixa (Não impede o trabalho)" },
  { value: "Media", label: "Média (Dificulta o trabalho)" },
  { value: "Alta", label: "Alta (Impede o trabalho de um setor)" },
  { value: "Critica", label: "Crítica (Parada geral)" },
];

function NewTicketScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ titulo: "", idCategoria: "", prioridade: "", descricao: "" });
  const [error, setError] = useState(null);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const ticket = await ticketsApi.criar({
        titulo: form.titulo,
        descricao: form.descricao,
        prioridade: form.prioridade,
        idCategoria: Number(form.idCategoria),
      });

      if (files.length > 0) {
        const anexos = await uploadAnexos(ticket.idTicket, files);
        if (anexos.length > 0) {
          await ticketsApi.salvarAnexos(ticket.idTicket, anexos);
        }
      }

      navigate("/app/meus-chamados");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-ticket-screen">
      <header className="new-ticket-screen__header">
        <h1 className="new-ticket-screen__title">Novo Chamado</h1>
        <p className="new-ticket-screen__subtitle">Preencha os detalhes abaixo para solicitar suporte técnico.</p>
      </header>

      <Card>
        <form onSubmit={handleSubmit}>
          <Card.Body>
            <div className="new-ticket-screen__form">
              {error && <p style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>{error}</p>}

              <Field
                id="titulo"
                label="Título do Chamado"
                placeholder="Ex: Falha na impressora do setor fiscal"
                value={form.titulo}
                onChange={update("titulo")}
                required
              />

              <div className="new-ticket-screen__row">
                <Select
                  id="categoria"
                  label="Categoria"
                  icon={Tag}
                  placeholder="Selecione a área"
                  value={form.idCategoria}
                  onChange={update("idCategoria")}
                  required
                  options={CATEGORIAS}
                />

                <Select
                  id="prioridade"
                  label="Impacto / Prioridade"
                  icon={AlertTriangle}
                  placeholder="Selecione o impacto"
                  value={form.prioridade}
                  onChange={update("prioridade")}
                  required
                  options={PRIORIDADES}
                />
              </div>

              <Textarea
                id="descricao"
                label="Descrição Detalhada"
                placeholder="Descreva o problema, mensagens de erro e passos para reproduzir..."
                value={form.descricao}
                onChange={update("descricao")}
                required
                rows={6}
              />

              <FileUpload
                label="Anexos (Opcional - Prints de erro ajudam muito)"
                files={files}
                onFilesChange={setFiles}
              />
            </div>
          </Card.Body>
          <Card.Footer>
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button icon={Send} type="submit" loading={loading}>Abrir Chamado</Button>
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
}

export default NewTicketScreen;
