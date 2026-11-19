import { useEffect, useRef, useState } from "react";
import {
  Search,
  Book,
  Monitor,
  Wifi,
  Lock,
  Printer,
  Plus,
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  Bold,
  Italic,
  Heading2,
  List,
  Code,
  Eye,
  Edit3,
} from "lucide-react";
import { Field, Button, Card, Badge, Modal, Select, Textarea } from "../../../shared/components";
import { uploadAnexos } from "../../../lib/storage";
import "./KnowledgeBaseScreen.css";

const ICON_MAP = {
  Acessos: Lock,
  Rede: Wifi,
  Hardware: Printer,
  Software: Monitor,
  Sistemas: Book,
};

const INITIAL_ARTICLES = [
  {
    id: 1,
    title: "Como resetar sua senha da VPN",
    desc: "Passo a passo para recuperar o acesso remoto à rede corporativa.",
    category: "Acessos",
    views: 0,
    updatedAt: "10/11/2026",
    author: "Equipe de Segurança TI",
    content: `## Recuperação de Credenciais VPN

Para redefinir sua senha de acesso à **VPN corporativa**, siga as etapas abaixo:

1. Acesse o **Portal de Autoatendimento de Identidade (SSO)** da empresa através da rede interna ou autenticação em duas etapas (*MFA*).
2. Clique em **Segurança da Conta** e selecione a opção \`Credenciais de Acesso Remoto (VPN)\`.
3. Clique em **Gerar Nova Senha / Token VPN** e confirme o código enviado ao seu aplicativo autenticador.
4. Abra o cliente VPN (\`FortiClient\` ou \`OpenVPN\`) no seu computador, desconecte a sessão antiga e insira a nova senha gerada.

> Caso sua conta esteja bloqueada por excesso de tentativas, abra um chamado na categoria **Rede** informando seu usuário de rede.`,
  },
  {
    id: 2,
    title: "Configuração do Wi-Fi Visitantes",
    desc: "Credenciais e política de uso da rede para parceiros e terceirizados.",
    category: "Rede",
    views: 0,
    updatedAt: "08/11/2026",
    author: "Infraestrutura e Redes",
    content: `## Acesso à Rede Sem Fio para Visitantes

A rede sem fio corporativa possui um SSID dedicado para visitantes e prestadores de serviço:

- **Nome da Rede (SSID):** \`HelpTicket-Guest\`
- **Validade do Voucher:** 8 horas por sessão
- **Portas Liberadas:** Navegação Web (\`80/TCP\` e \`443/TCP\`)

### Passo a passo de conexão
1. Conecte-se à rede Wi-Fi chamada **HelpTicket-Guest**.
2. Ao abrir o navegador, você será redirecionado automaticamente para o **Portal Captivo**.
3. Informe o CPF/E-mail do visitante e o código de voucher diário (disponível na recepção ou com o gestor responsável).`,
  },
  {
    id: 3,
    title: "Mapeamento de Impressora no Windows",
    desc: "Como adicionar e instalar os drivers das impressoras de rede do seu setor.",
    category: "Hardware",
    views: 0,
    updatedAt: "05/11/2026",
    author: "Suporte Nível 1",
    content: `## Como mapear impressoras de rede

Para adicionar a impressora do seu departamento no **Windows 10** ou **Windows 11**:

1. Pressione as teclas \`Windows + R\` no teclado para abrir a janela **Executar**.
2. Digite o caminho do servidor de impressão: \`\\\\srv-print.helpticket.local\` e pressione **Enter**.
3. Localize a impressora correspondente ao seu setor (ex: \`IMP-FISCAL-01\`, \`IMP-RH-02\`, \`IMP-DIRETORIA\`).
4. Clique com o botão direito sobre ela e selecione **Conectar**. O Windows fará o download e instalação do driver automaticamente.

> **Dica:** Se a fila estiver travada, reinicie o serviço \`Spooler de Impressão\` ou abra um chamado na categoria **Hardware**.`,
  },
  {
    id: 4,
    title: "Atualização Obrigatória do Antivírus",
    desc: "Procedimento para forçar o update da central de segurança da máquina.",
    category: "Software",
    views: 0,
    updatedAt: "01/11/2026",
    author: "Equipe de Segurança TI",
    content: `## Atualização do Agente de Proteção Endpoint

Manter as definições de vírus atualizadas é **obrigatório** pela política de segurança da informação:

1. Localize o ícone do agente de proteção (*escudo de segurança*) na bandeja do sistema, próximo ao relógio do Windows.
2. Clique com o botão direito sobre o ícone e escolha **Verificar Atualizações Agora**.
3. Aguarde o download das novas assinaturas de ameaças (leva cerca de 2 minutos).
4. Caso apareça a mensagem \`Servidor de atualização inacessível\`, verifique se você está conectado à VPN ou rede interna e tente novamente.`,
  },
  {
    id: 5,
    title: "Acesso ao Portal RH",
    desc: "Como solicitar férias e visualizar contracheque na nova plataforma.",
    category: "Sistemas",
    views: 0,
    updatedAt: "12/11/2026",
    author: "Sistemas Corporativos",
    content: `## Guia Rápido do Portal do Colaborador (RH)

O novo Portal do Colaborador utiliza o mesmo login do seu **e-mail corporativo**:

1. Acesse o endereço interno do Portal RH pelo navegador **Chrome** ou **Edge**.
2. Clique em **Entrar com Conta Corporativa (SSO)**.
3. No menu lateral, acesse **Demonstrativos** para baixar seus holerites em PDF ou **Férias e Recessos** para programar períodos aquisitivos.
4. Em caso de erro de cadastro ou divergência de lotação, acione o setor de RH ou abra um chamado na categoria **Software**.`,
  },
];

const STORAGE_KEY = "helpticket_kb_articles_v3";

function formatViews(views) {
  const count = Number(views) || 0;
  return `${count} ${count === 1 ? "leitura" : "leituras"}`;
}

function loadArticles() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_ARTICLES;
}

function renderInlineMarkdown(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={key++}
          style={{
            background: "var(--color-surface-hover)",
            padding: "2px 6px",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.9em",
            border: "1px solid var(--color-border)",
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-primary)", textDecoration: "underline" }}
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function MarkdownContent({ content = "", onImageClick }) {
  const lines = content.split("\n");
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={i} style={{ height: "var(--space-2)" }} />);
      continue;
    }

    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\((.+)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1] || "Imagem do artigo";
      const url = imgMatch[2];
      elements.push(
        <figure key={i} style={{ margin: "var(--space-4) 0" }}>
          <img
            src={url}
            alt={alt}
            onClick={() => onImageClick?.({ url, nome: alt })}
            title="Clique para ampliar"
            style={{
              maxWidth: "100%",
              maxHeight: "420px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              cursor: onImageClick ? "zoom-in" : "default",
              display: "block",
            }}
          />
          {alt && (
            <figcaption style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
              {alt}
            </figcaption>
          )}
        </figure>
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", margin: "var(--space-4) 0 var(--space-2)" }}>
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", margin: "var(--space-5) 0 var(--space-2)" }}>
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={i} style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", margin: "var(--space-5) 0 var(--space-3)" }}>
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          style={{
            margin: "var(--space-3) 0",
            padding: "var(--space-3) var(--space-4)",
            borderLeft: "4px solid var(--color-primary)",
            background: "var(--color-surface-hover)",
            borderRadius: "0 var(--radius-md) var(--radius-md) 0",
            color: "var(--color-text-secondary)",
          }}
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: "var(--space-2)", paddingLeft: "var(--space-3)", margin: "4px 0" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>•</span>
          <span>{renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}</span>
        </div>
      );
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: "var(--space-2)", paddingLeft: "var(--space-2)", margin: "6px 0" }}>
          <span style={{ color: "var(--color-primary)", fontWeight: "var(--weight-semibold)", minWidth: "20px" }}>
            {numMatch[1]}.
          </span>
          <span>{renderInlineMarkdown(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    elements.push(
      <p key={i} style={{ margin: "6px 0", lineHeight: 1.7 }}>
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  return <div>{elements}</div>;
}

function KnowledgeBaseScreen() {
  const storedUser = JSON.parse(localStorage.getItem("helpticket_user") || "{}");
  const isStaff = storedUser.tipoUsuario === "Agente" || storedUser.tipoUsuario === "Administrador";
  const fileInputRef = useRef(null);

  const [articles, setArticles] = useState(loadArticles);
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [form, setForm] = useState({
    title: "",
    desc: "",
    category: "Software",
    content: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  }, [articles]);

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const insertMarkdownSnippet = (snippet) => {
    const el = document.getElementById("kb-content");
    if (!el) {
      setForm((prev) => ({
        ...prev,
        content: prev.content ? `${prev.content}\n${snippet}` : snippet,
      }));
      return;
    }
    const start = el.selectionStart ?? form.content.length;
    const end = el.selectionEnd ?? form.content.length;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    const needNewlineBefore = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const needNewlineAfter = after.length > 0 && !after.startsWith("\n") ? "\n" : "";
    const inserted = `${needNewlineBefore}${snippet}${needNewlineAfter}`;
    const nextContent = `${before}${inserted}${after}`;

    setForm((prev) => ({ ...prev, content: nextContent }));
    setTimeout(() => {
      el.focus();
      const cursor = before.length + inserted.length;
      el.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const applyFormatToSelection = ({ prefix = "", suffix = "", placeholder = "texto", blockPrefix = false }) => {
    const el = document.getElementById("kb-content");
    const current = form.content;
    if (!el) {
      insertMarkdownSnippet(`${prefix}${placeholder}${suffix}`);
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const selected = current.slice(start, end);
    const before = current.slice(0, start);
    const after = current.slice(end);

    let replacement;
    let selStart;
    let selEnd;

    if (blockPrefix) {
      const targetText = selected || placeholder;
      const lines = targetText.split("\n");
      const formattedLines = lines.map((line, idx) =>
        prefix === "1. " ? `${idx + 1}. ${line}` : `${prefix}${line}`
      );
      const block = formattedLines.join("\n");
      const needNewline = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
      replacement = `${needNewline}${block}`;
      selStart = before.length + needNewline.length;
      selEnd = selStart + block.length;
    } else {
      const inner = selected || placeholder;
      replacement = `${prefix}${inner}${suffix}`;
      selStart = before.length + prefix.length;
      selEnd = selStart + inner.length;
    }

    const nextContent = `${before}${replacement}${after}`;
    setForm((prev) => ({ ...prev, content: nextContent }));

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    }, 0);
  };

  const uploadAndInsertImages = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingImg(true);
    try {
      const uploaded = await uploadAnexos("kb", files);
      if (uploaded.length > 0) {
        const mdImages = uploaded.map((a) => `![${a.nomeArquivo}](${a.caminho})`).join("\n");
        insertMarkdownSnippet(mdImages);
      }
    } finally {
      setUploadingImg(false);
    }
  };

  const handleUploadImage = async (e) => {
    const files = Array.from(e.target.files || []);
    await uploadAndInsertImages(files);
    e.target.value = "";
  };

  const handlePasteMarkdown = async (e) => {
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
      await uploadAndInsertImages(pastedFiles);
    }
  };

  const handleOpenArticle = (article) => {
    const newViews = (Number(article.views) || 0) + 1;
    const updated = { ...article, views: newViews };
    setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
    setSelectedArticle(updated);
  };

  const openNewArticleModal = () => {
    setEditingArticleId(null);
    setForm({ title: "", desc: "", category: "Software", content: "" });
    setPreviewTab(false);
    setModalOpen(true);
  };

  const openEditArticleModal = (article) => {
    setEditingArticleId(article.id);
    setForm({
      title: article.title || "",
      desc: article.desc || "",
      category: article.category || "Software",
      content: article.content || "",
    });
    setPreviewTab(false);
    setModalOpen(true);
  };

  const handleSaveArticle = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const resumo =
      form.desc.trim() ||
      form.content.replace(/[#*`>!]/g, "").trim().slice(0, 110) + "...";

    if (editingArticleId !== null) {
      const dataHoje = new Date().toLocaleDateString("pt-BR");
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticleId
            ? {
                ...a,
                title: form.title.trim(),
                desc: resumo,
                category: form.category,
                content: form.content.trim(),
                updatedAt: dataHoje,
              }
            : a
        )
      );
      if (selectedArticle?.id === editingArticleId) {
        setSelectedArticle((prev) => ({
          ...prev,
          title: form.title.trim(),
          desc: resumo,
          category: form.category,
          content: form.content.trim(),
          updatedAt: dataHoje,
        }));
      }
    } else {
      const novo = {
        id: Date.now(),
        title: form.title.trim(),
        desc: resumo,
        category: form.category,
        views: 0,
        updatedAt: new Date().toLocaleDateString("pt-BR"),
        author: storedUser.nome || "Equipe de TI",
        content: form.content.trim(),
      };
      setArticles((prev) => [novo, ...prev]);
    }

    setEditingArticleId(null);
    setForm({ title: "", desc: "", category: "Software", content: "" });
    setPreviewTab(false);
    setModalOpen(false);
  };

  const handleDeleteArticle = (id) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    if (selectedArticle?.id === id) {
      setSelectedArticle(null);
    }
  };

  const articleModal = (
    <Modal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title={editingArticleId !== null ? "Editar Artigo da Base de Conhecimento" : "Novo Artigo da Base de Conhecimento"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button
            disabled={!form.title.trim() || !form.content.trim()}
            onClick={handleSaveArticle}
          >
            {editingArticleId !== null ? "Salvar Alterações" : "Publicar Artigo"}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Field
          id="kb-title"
          label="Título do Artigo"
          placeholder="Ex: Como configurar o e-mail no celular"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--space-4)" }}>
          <Select
            id="kb-category"
            label="Categoria"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            options={[
              { value: "Hardware", label: "Hardware" },
              { value: "Software", label: "Software" },
              { value: "Rede", label: "Rede" },
              { value: "Acessos", label: "Acessos" },
              { value: "Sistemas", label: "Sistemas" },
            ]}
          />
          <Field
            id="kb-desc"
            label="Resumo curto"
            placeholder="Breve descrição exibida no card..."
            value={form.desc}
            onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
          />
        </div>

        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-2)",
            flexWrap: "wrap",
            gap: "var(--space-2)",
          }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-primary)" }}>
              Conteúdo (Suporta Markdown e Imagens)
            </span>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleUploadImage}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Heading2}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatToSelection({ prefix: "## ", placeholder: "Subtítulo da Etapa", blockPrefix: true })}
                title="Inserir Subtítulo"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Bold}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatToSelection({ prefix: "**", suffix: "**", placeholder: "texto em negrito" })}
                title="Negrito"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Italic}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatToSelection({ prefix: "*", suffix: "*", placeholder: "texto em itálico" })}
                title="Itálico"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={List}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatToSelection({ prefix: "1. ", placeholder: "Primeiro passo\nSegundo passo", blockPrefix: true })}
                title="Lista"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Code}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormatToSelection({ prefix: "`", suffix: "`", placeholder: "comando ou código" })}
                title="Código"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={ImageIcon}
                loading={uploadingImg}
                onClick={() => fileInputRef.current?.click()}
              >
                Imagem
              </Button>
              <Button
                type="button"
                variant={previewTab ? "primary" : "ghost"}
                size="sm"
                icon={previewTab ? Edit3 : Eye}
                onClick={() => setPreviewTab((v) => !v)}
              >
                {previewTab ? "Editar" : "Preview"}
              </Button>
            </div>
          </div>

          {previewTab ? (
            <div
              style={{
                minHeight: "200px",
                maxHeight: "340px",
                overflowY: "auto",
                padding: "var(--space-4)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface)",
              }}
            >
              {form.content.trim() ? (
                <MarkdownContent content={form.content} />
              ) : (
                <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                  Nenhum conteúdo para pré-visualizar.
                </span>
              )}
            </div>
          ) : (
            <Textarea
              id="kb-content"
              placeholder="Use Markdown (## Título, **negrito**, `código`, 1. Lista), cole um print com Ctrl+V ou clique em 'Imagem'..."
              rows={8}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              onPaste={handlePasteMarkdown}
              required
            />
          )}
        </div>
      </div>
    </Modal>
  );

  if (selectedArticle) {
    const IconComponent = ICON_MAP[selectedArticle.category] || Book;
    return (
      <div className="kb-screen">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => setSelectedArticle(null)}
            style={{ paddingLeft: 0 }}
          >
            Voltar para Base de Conhecimento
          </Button>
          {isStaff && (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button
                variant="outline"
                size="sm"
                icon={Edit3}
                onClick={() => openEditArticleModal(selectedArticle)}
              >
                Editar Artigo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => handleDeleteArticle(selectedArticle.id)}
                style={{ color: "var(--color-error)" }}
              >
                Excluir Artigo
              </Button>
            </div>
          )}
        </div>

        <Card>
          <Card.Body style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", padding: "var(--space-8)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div className="kb-article-card__icon">
                <IconComponent size={22} />
              </div>
              <Badge tone="info" dot>{selectedArticle.category}</Badge>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Atualizado em {selectedArticle.updatedAt || "12/11/2026"} • Por {selectedArticle.author || "Equipe de TI"} • {formatViews(selectedArticle.views)}
              </span>
            </div>

            <div>
              <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-2) 0" }}>
                {selectedArticle.title}
              </h1>
              <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-secondary)", margin: 0 }}>
                {selectedArticle.desc}
              </p>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: 0 }} />

            <div style={{ fontSize: "var(--text-base)", color: "var(--color-text-primary)" }}>
              <MarkdownContent
                content={selectedArticle.content}
                onImageClick={(img) => setPreviewImageModal(img)}
              />
            </div>
          </Card.Body>
        </Card>

        <Modal
          open={!!previewImageModal}
          onClose={() => setPreviewImageModal(null)}
          title={previewImageModal?.nome || "Imagem"}
          size="lg"
        >
          {previewImageModal && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={previewImageModal.url}
                alt={previewImageModal.nome}
                style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: "var(--radius-md)", objectFit: "contain" }}
              />
            </div>
          )}
        </Modal>
        {articleModal}
      </div>
    );
  }

  return (
    <div className="kb-screen">
      <header className="kb-screen__header">
        <h1 className="kb-screen__title">Como podemos ajudar?</h1>
        <p className="kb-screen__subtitle">Busque em nossa base de conhecimento soluções rápidas antes de abrir um chamado.</p>
        
        <div className="kb-screen__search">
          <Field 
            id="kb-search" 
            placeholder="Pesquisar por artigos, tutoriais ou manuais..." 
            icon={Search} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", margin: 0, color: "var(--color-text-primary)" }}>
            Artigos Populares
          </h2>
          {isStaff && (
            <Button icon={Plus} onClick={openNewArticleModal}>
              Novo Artigo
            </Button>
          )}
        </div>
        
        <div className="kb-screen__grid">
          {filteredArticles.map(article => {
            const IconComponent = ICON_MAP[article.category] || Book;
            return (
              <div
                key={article.id}
                className="kb-article-card"
                onClick={() => handleOpenArticle(article)}
              >
                <div className="kb-article-card__icon">
                  <IconComponent size={20} />
                </div>
                <h3 className="kb-article-card__title">{article.title}</h3>
                <p className="kb-article-card__desc">{article.desc}</p>
                <div className="kb-article-card__meta">
                  <span style={{ fontWeight: "var(--weight-medium)" }}>{article.category}</span>
                  <span>•</span>
                  <span>{formatViews(article.views)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {articleModal}
    </div>
  );
}

export default KnowledgeBaseScreen;
