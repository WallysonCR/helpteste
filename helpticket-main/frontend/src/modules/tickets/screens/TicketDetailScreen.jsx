import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Calendar, Paperclip, FileText, Download, X } from "lucide-react";
import { Card, Button, PriorityBadge, StatusBadge, Avatar, Textarea, Select, Badge, Modal } from "../../../shared/components";
import { ticketsApi, usuariosApi } from "../../../lib/api";
import { uploadAnexos } from "../../../lib/storage";
import { isImageUrl, parseCommentMessage } from "../utils/commentParser";
import "./TicketDetailScreen.css";

function TicketDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const storedUser = JSON.parse(localStorage.getItem("helpticket_user") || "{}");
  const isStaff = storedUser.tipoUsuario === "Agente" || storedUser.tipoUsuario === "Administrador";

  const [ticket, setTicket] = useState(null);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [previewModal, setPreviewModal] = useState(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [idAgente, setIdAgente] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [data, usuarios] = await Promise.all([
          ticketsApi.obterPorId(id),
          usuariosApi.listar(),
        ]);
        const listaAgentes = usuarios.filter(u => u.tipo === "Agente");
        setAgentes(listaAgentes);
        setTicket(data);
        setStatus(data.status);
        const agenteAtualId =
          data.idAgente ??
          listaAgentes.find(a => a.nome === data.nomeAgente)?.idUsuario;
        setIdAgente(agenteAtualId ? String(agenteAtualId) : "");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleStatusChange = async (novoStatus) => {
    setStatus(novoStatus);
    await ticketsApi.atualizarStatus(id, novoStatus);
  };

  const handleAtribuirAgente = async (novoIdAgente) => {
    setIdAgente(novoIdAgente);
    if (novoIdAgente) {
      await ticketsApi.atribuirAgente(id, Number(novoIdAgente));
      const agente = agentes.find(a => a.idUsuario === Number(novoIdAgente));
      if (status === "Aberto") {
        setStatus("EmAtendimento");
      }
      setTicket(prev => ({
        ...prev,
        nomeAgente: agente?.nome,
        status: prev.status === "Aberto" ? "EmAtendimento" : prev.status,
      }));
    }
  };

  const addFilesToPending = (files) => {
    if (!files || files.length === 0) return;
    const withPreview = files.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      isImage: file.type.startsWith("image/"),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setPendingFiles((prev) => [...prev, ...withPreview]);
  };

  const handleSelectFiles = (e) => {
    const files = Array.from(e.target.files || []);
    addFilesToPending(files);
    e.target.value = "";
  };

  const handlePasteComment = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const pastedFiles = items
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => {
        const blob = item.getAsFile();
        if (!blob) return null;
        const ext = (blob.type.split("/")[1] || "png").replace(/[^a-z0-9]/gi, "");
        return new File([blob], `print-${Date.now()}.${ext}`, { type: blob.type });
      })
      .filter(Boolean);

    if (pastedFiles.length > 0) {
      e.preventDefault();
      addFilesToPending(pastedFiles);
    }
  };

  const handleRemovePendingFile = (itemId) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== itemId));
  };

  const handleSendComment = async () => {
    if (!comment.trim() && pendingFiles.length === 0) return;
    setSending(true);
    try {
      const partes = [];

      if (pendingFiles.length > 0) {
        const uploaded = await uploadAnexos(
          id,
          pendingFiles.map((p) => p.file)
        );
        if (uploaded.length > 0) {
          for (const a of uploaded) {
            if (isImageUrl(a.caminho, a.nomeArquivo, a.tipoArquivo)) {
              partes.push(`![${a.nomeArquivo}](${a.caminho})`);
            } else {
              partes.push(`[anexo:${a.nomeArquivo}](${a.caminho})`);
            }
          }
        }
      }

      if (comment.trim()) {
        partes.push(comment.trim());
      }

      const mensagemFinal = partes.join("\n");
      if (mensagemFinal) {
        await ticketsApi.adicionarComentario(id, mensagemFinal, false);
      }

      const atualizado = await ticketsApi.obterPorId(id);
      setTicket(atualizado);
      setComment("");
      setPendingFiles([]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-detail-screen">
        <main className="ticket-detail-screen__main">
          <div className="ht-skeleton" style={{ width: "80px", height: "28px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div className="ht-skeleton" style={{ width: "130px", height: "22px" }} />
            <div className="ht-skeleton" style={{ width: "60%", height: "34px" }} />
          </div>
          <Card>
            <Card.Body style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div className="ht-skeleton" style={{ width: "100%", height: "18px" }} />
              <div className="ht-skeleton" style={{ width: "85%", height: "18px" }} />
              <div className="ht-skeleton" style={{ width: "45%", height: "18px" }} />
            </Card.Body>
          </Card>
          <div className="ht-loader-card">
            <div className="ht-spinner" />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
              Carregando detalhes e histórico do chamado...
            </span>
          </div>
        </main>
        <aside className="ticket-detail-screen__sidebar">
          <Card>
            <Card.Body style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div className="ht-skeleton" style={{ width: "100%", height: "42px" }} />
              <div className="ht-skeleton" style={{ width: "100%", height: "42px" }} />
              <div className="ht-skeleton" style={{ width: "60%", height: "28px" }} />
              <div className="ht-skeleton" style={{ width: "80%", height: "36px" }} />
            </Card.Body>
          </Card>
        </aside>
      </div>
    );
  }
  if (!ticket) return <div className="ht-loader-card">Chamado não encontrado.</div>;

  const aberturaMs = new Date(ticket.dataAbertura).getTime();
  const anexosAbertura = (ticket.anexos ?? []).filter(
    (a) => Math.abs(new Date(a.dataUpload).getTime() - aberturaMs) < 60000
  );
  const anexosTrilha = (ticket.anexos ?? []).filter(
    (a) => Math.abs(new Date(a.dataUpload).getTime() - aberturaMs) >= 60000
  );

  const timelineItems = [
    ...(ticket.comentarios ?? []).map((c) => ({
      key: `c-${c.idComentario}`,
      nomeAutor: c.nomeAutor,
      dataCriacao: c.dataCriacao,
      mensagem: c.mensagem,
    })),
    ...anexosTrilha.map((a) => ({
      key: `a-${a.idAnexo}`,
      nomeAutor: ticket.nomeAgente || ticket.nomeSolicitante,
      dataCriacao: a.dataUpload,
      mensagem: isImageUrl(a.caminho, a.nomeArquivo, a.tipoArquivo)
        ? `![${a.nomeArquivo}](${a.caminho})`
        : `[anexo:${a.nomeArquivo}](${a.caminho})`,
    })),
  ].sort((x, y) => new Date(x.dataCriacao) - new Date(y.dataCriacao));

  return (
    <div className="ticket-detail-screen">
      <main className="ticket-detail-screen__main">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} style={{ alignSelf: "flex-start", paddingLeft: 0 }}>
          Voltar
        </Button>

        <header className="ticket-detail__header">
          <div className="ticket-detail__meta">
            <span className="ticket-detail__id">#{ticket.idTicket}</span>
            <Badge tone="neutral" dot>{ticket.nomeCategoria}</Badge>
          </div>
          <h1 className="ticket-detail__title">{ticket.titulo}</h1>
        </header>

        <div className="ticket-detail__description">{ticket.descricao}</div>

        {anexosAbertura.length > 0 && (
          <div className="ticket-detail__anexos">
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", marginBottom: "var(--space-2)", color: "var(--color-text-secondary)" }}>Anexos</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
              {anexosAbertura.map(a => {
                const ehImagem = isImageUrl(a.caminho, a.nomeArquivo, a.tipoArquivo);
                if (ehImagem) {
                  return (
                    <div
                      key={a.idAnexo}
                      onClick={() => setPreviewModal({ url: a.caminho, nome: a.nomeArquivo })}
                      style={{
                        cursor: "pointer",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        background: "var(--color-surface)",
                        maxWidth: "220px",
                      }}
                    >
                      <img
                        src={a.caminho}
                        alt={a.nomeArquivo}
                        style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }}
                      />
                      <div style={{
                        padding: "var(--space-1) var(--space-2)",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {a.nomeArquivo} ({a.tamanhoKb}KB)
                      </div>
                    </div>
                  );
                }
                return (
                  <a
                    key={a.idAnexo}
                    href={a.caminho}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: "var(--space-2)",
                      padding: "var(--space-2) var(--space-3)",
                      border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-sm)", color: "var(--color-text-primary)",
                      textDecoration: "none", background: "var(--color-surface)"
                    }}
                  >
                    <FileText size={14} />
                    {a.nomeArquivo}
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>{a.tamanhoKb}KB</span>
                    <Download size={12} />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <section className="ticket-timeline">
          <h3 style={{ fontSize: "var(--text-lg)", margin: "var(--space-2) 0" }}>Histórico do Chamado</h3>

          {timelineItems.map(c => {
            const parsed = parseCommentMessage(c.mensagem);
            return (
              <div key={c.key} className="timeline-event">
                <div className="timeline-event__avatar">
                  <Avatar name={c.nomeAutor} size="md" />
                </div>
                <div className="timeline-event__content">
                  <div className="timeline-event__header">
                    <span className="timeline-event__author">{c.nomeAutor}</span>
                    <span className="timeline-event__time">{new Date(c.dataCriacao).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="timeline-event__body">
                    {parsed.images.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: parsed.text ? "var(--space-3)" : 0 }}>
                        {parsed.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={img.nome}
                            title="Clique para ampliar"
                            onClick={() => setPreviewModal({ url: img.url, nome: img.nome })}
                            style={{
                              maxWidth: "320px",
                              maxHeight: "220px",
                              borderRadius: "var(--radius-md)",
                              border: "1px solid var(--color-border)",
                              cursor: "zoom-in",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {parsed.files.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: parsed.text ? "var(--space-2)" : 0 }}>
                        {parsed.files.map((f, idx) => (
                          <a
                            key={idx}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 10px",
                              border: "1px solid var(--color-border)",
                              borderRadius: "var(--radius-md)",
                              fontSize: "var(--text-xs)",
                              color: "var(--color-text-primary)",
                              textDecoration: "none",
                            }}
                          >
                            <FileText size={14} />
                            {f.nome}
                            <Download size={12} />
                          </a>
                        ))}
                      </div>
                    )}
                    {parsed.text && <div style={{ whiteSpace: "pre-wrap" }}>{parsed.text}</div>}
                  </div>
                </div>
              </div>
            );
          })}

          <Card style={{ marginTop: "var(--space-4)" }}>
            <Card.Body>
              {pendingFiles.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                  {pendingFiles.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        position: "relative",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        background: "var(--color-surface-hover)",
                        padding: item.isImage ? 0 : "var(--space-2) var(--space-3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      {item.isImage ? (
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          onClick={() => setPreviewModal({ url: item.previewUrl, nome: item.file.name })}
                          style={{ width: "110px", height: "80px", objectFit: "cover", cursor: "zoom-in", display: "block" }}
                        />
                      ) : (
                        <>
                          <FileText size={16} />
                          <span style={{ fontSize: "var(--text-xs)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.file.name}
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePendingFile(item.id)}
                        title="Remover anexo"
                        style={{
                          position: item.isImage ? "absolute" : "static",
                          top: 4,
                          right: 4,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(0,0,0,0.65)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Textarea
                placeholder="Escreva uma resposta ou cole (Ctrl+V) um print da área de transferência..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onPaste={handlePasteComment}
                rows={4}
                style={{ marginBottom: 0 }}
              />
            </Card.Body>
            <Card.Footer style={{ justifyContent: "space-between" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                multiple
                style={{ display: "none" }}
                onChange={handleSelectFiles}
              />
              <Button
                variant="outline"
                icon={Paperclip}
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Anexar
              </Button>
              <Button
                icon={Send}
                loading={sending}
                disabled={!comment.trim() && pendingFiles.length === 0}
                onClick={handleSendComment}
              >
                Enviar Resposta
              </Button>
            </Card.Footer>
          </Card>
        </section>
      </main>

      <aside className="ticket-detail-screen__sidebar">
        <Card>
          <Card.Body style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

            {isStaff ? (
              <>
                <div className="ticket-sidebar__section">
                  <span className="ticket-sidebar__label">Mudar Status</span>
                  <Select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    options={[
                      { value: "Aberto", label: "Aberto" },
                      { value: "EmAtendimento", label: "Em Atendimento" },
                      { value: "Resolvido", label: "Resolvido" },
                      { value: "Fechado", label: "Fechado" },
                    ]}
                  />
                </div>

                <div className="ticket-sidebar__section">
                  <span className="ticket-sidebar__label">Atribuir Agente</span>
                  <Select
                    value={idAgente}
                    onChange={(e) => handleAtribuirAgente(e.target.value)}
                    placeholder="Selecionar agente..."
                    options={agentes.map(a => {
                      const isCurrent = String(a.idUsuario) === String(idAgente);
                      const isMe = a.idUsuario === storedUser.idUsuario || a.nome === storedUser.nome;
                      let label = a.nome;
                      if (isCurrent) label = `✓ ${a.nome} (Atendente atual)`;
                      else if (isMe) label = `${a.nome} (Você)`;
                      return { value: String(a.idUsuario), label };
                    })}
                  />
                </div>
              </>
            ) : (
              <div className="ticket-sidebar__section">
                <span className="ticket-sidebar__label">Status</span>
                <div className="ticket-sidebar__value">
                  <StatusBadge status={status?.toLowerCase()} />
                </div>
              </div>
            )}

            <div className="ticket-sidebar__section">
              <span className="ticket-sidebar__label">Prioridade</span>
              <div className="ticket-sidebar__value">
                <PriorityBadge priority={ticket.prioridade?.toLowerCase()} />
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

            <div className="ticket-sidebar__section">
              <span className="ticket-sidebar__label">Solicitante</span>
              <div className="ticket-sidebar__value">
                <Avatar name={ticket.nomeSolicitante} size="sm" />
                {ticket.nomeSolicitante}
              </div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{ticket.emailSolicitante}</span>
            </div>

            <div className="ticket-sidebar__section">
              <span className="ticket-sidebar__label">Atribuído para</span>
              <div className="ticket-sidebar__value">
                <Avatar name={ticket.nomeAgente ?? "?"} size="sm" />
                {ticket.nomeAgente ?? "Não atribuído"}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

            <div className="ticket-sidebar__section">
              <span className="ticket-sidebar__label">Abertura</span>
              <div className="ticket-sidebar__value">
                <Calendar size={16} /> {new Date(ticket.dataAbertura).toLocaleString("pt-BR")}
              </div>
            </div>

          </Card.Body>
        </Card>
      </aside>

      <Modal
        open={!!previewModal}
        onClose={() => setPreviewModal(null)}
        title={previewModal?.nome || "Visualizar Anexo"}
        size="lg"
      >
        {previewModal && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
            <img
              src={previewModal.url}
              alt={previewModal.nome}
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                borderRadius: "var(--radius-md)",
                objectFit: "contain",
              }}
            />
            <a
              href={previewModal.url}
              download={previewModal.nome}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "var(--text-sm)",
                color: "var(--color-primary)",
                textDecoration: "none",
              }}
            >
              <Download size={15} /> Abrir / Baixar imagem original
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TicketDetailScreen;
