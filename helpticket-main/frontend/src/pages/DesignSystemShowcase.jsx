import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Edit, Search, Mail, Lock, Tag,
  Headphones, ClipboardList, CheckCircle, Clock, AlertTriangle,
  BarChart3, Users, Inbox, Settings
} from "lucide-react";
import {
  Button, Badge, StatusBadge, PriorityBadge, Card, StatCard,
  Avatar, Field, Select, Textarea, FileUpload, Banner, Table,
  Modal, EmptyState, Pagination
} from "../shared/components";
import "./DesignSystemShowcase.css";

function DesignSystemShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [selectValue, setSelectValue] = useState("");
  const [textValue, setTextValue] = useState("");

  const sampleTableData = [
    { id: "#TKT-1023", title: "Impressora de Rede Offline", client: "Globex Indústria", priority: "media", status: "em_andamento", date: "1 hora atrás" },
    { id: "#TKT-1021", title: "Solicitação de Acesso VPN", client: "Initech LLC", priority: "baixa", status: "aguardando", date: "2 dias atrás" },
    { id: "#TKT-1018", title: "Licença Office 365 Expirada", client: "Umbrella Corp", priority: "alta", status: "aberto", date: "Ontem 14:30" },
    { id: "#TKT-1024", title: "Falha de Autenticação no ERP", client: "Acme Corp", priority: "critica", status: "novo", date: "10 min atrás" },
  ];

  const tableColumns = [
    { key: "id", label: "ID", cellClass: "ht-table__cell--mono" },
    { key: "title", label: "Título" },
    { key: "client", label: "Cliente" },
    { key: "priority", label: "Prioridade", render: (val) => <PriorityBadge priority={val} size="sm" /> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} size="sm" /> },
    { key: "date", label: "Aberto em", cellClass: "ht-table__cell--muted" },
  ];

  return (
    <div className="showcase">
      <Link to="/" className="showcase__back-link"><ArrowLeft size={16} /> Voltar ao Login</Link>

      <h1>🎨 HelpTicket Design System</h1>
      <p>Catálogo completo de componentes reutilizáveis do sistema.</p>

      {/* ═══ BUTTONS ═══ */}
      <section className="showcase__section">
        <h2>Button</h2>
        <p>Variantes, tamanhos e estados.</p>

        <div className="showcase__label">Variantes</div>
        <div className="showcase__row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
        </div>

        <div className="showcase__label">Com ícone</div>
        <div className="showcase__row">
          <Button icon={Plus}>Novo Chamado</Button>
          <Button variant="secondary" icon={Edit}>Editar</Button>
          <Button variant="danger" icon={Trash2}>Excluir</Button>
          <Button variant="ghost" icon={Search} iconOnly aria-label="Buscar" />
          <Button variant="secondary" icon={Settings} iconOnly aria-label="Config" />
        </div>

        <div className="showcase__label">Tamanhos</div>
        <div className="showcase__row">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <div className="showcase__label">Estados</div>
        <div className="showcase__row">
          <Button loading>Salvando...</Button>
          <Button disabled>Desabilitado</Button>
          <Button full>Full Width</Button>
        </div>
      </section>

      {/* ═══ BADGES ═══ */}
      <section className="showcase__section">
        <h2>Badge / StatusBadge / PriorityBadge</h2>
        <p>Labels coloridas para categorização.</p>

        <div className="showcase__label">Badge genérico</div>
        <div className="showcase__row">
          <Badge tone="info">Info</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="error">Error</Badge>
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="info" dot>Com dot</Badge>
        </div>

        <div className="showcase__label">Status do Ticket</div>
        <div className="showcase__row">
          <StatusBadge status="novo" />
          <StatusBadge status="aberto" />
          <StatusBadge status="em_andamento" />
          <StatusBadge status="aguardando" />
          <StatusBadge status="resolvido" />
          <StatusBadge status="fechado" />
        </div>

        <div className="showcase__label">Prioridade</div>
        <div className="showcase__row">
          <PriorityBadge priority="baixa" />
          <PriorityBadge priority="media" />
          <PriorityBadge priority="alta" />
          <PriorityBadge priority="critica" />
        </div>
      </section>

      {/* ═══ AVATAR ═══ */}
      <section className="showcase__section">
        <h2>Avatar</h2>
        <p>Representação visual de usuários com iniciais automáticas e cores determinísticas.</p>

        <div className="showcase__label">Tamanhos</div>
        <div className="showcase__row">
          <Avatar name="Leonardo" size="sm" />
          <Avatar name="André Cavalcante" size="md" />
          <Avatar name="Maria Silva" size="lg" />
          <Avatar name="Admin" size="xl" />
        </div>

        <div className="showcase__label">Com status</div>
        <div className="showcase__row">
          <Avatar name="João Paulo" size="lg" status="online" />
          <Avatar name="Ana Clara" size="lg" status="offline" />
          <Avatar name="Carlos Lima" size="lg" status="busy" />
        </div>

        <div className="showcase__label">Cores automáticas</div>
        <div className="showcase__row">
          <Avatar name="Alice" size="md" />
          <Avatar name="Bruno" size="md" />
          <Avatar name="Camila" size="md" />
          <Avatar name="Diego" size="md" />
          <Avatar name="Elena" size="md" />
          <Avatar name="Fernando" size="md" />
        </div>
      </section>

      {/* ═══ STAT CARDS ═══ */}
      <section className="showcase__section">
        <h2>StatCard</h2>
        <p>KPIs para dashboards.</p>
        <div className="showcase__grid-4">
          <StatCard icon={ClipboardList} label="Em Aberto" value="12" subtitle="Chamados na sua fila" tone="info" />
          <StatCard icon={Clock} label="Em Atendimento" value="5" subtitle="Aguardando sua ação" tone="warning" />
          <StatCard icon={CheckCircle} label="Resolvidos Hoje" value="8" subtitle="+2 em relação a ontem" tone="success" />
          <StatCard icon={AlertTriangle} label="Críticos" value="3" subtitle="Ação imediata requerida" tone="error" accent />
        </div>
      </section>

      {/* ═══ CARD ═══ */}
      <section className="showcase__section">
        <h2>Card</h2>
        <p>Container flexível com Header, Body e Footer compostos.</p>
        <div className="showcase__grid-2">
          <Card>
            <Card.Header title="Card Simples" subtitle="Com header e body" />
            <Card.Body>
              Conteúdo do card com informações relevantes para o usuário.
            </Card.Body>
          </Card>

          <Card interactive>
            <Card.Header
              title="Card Interativo"
              subtitle="Hover para ver o efeito"
              action={<Button size="sm" variant="outline" icon={Edit}>Editar</Button>}
            />
            <Card.Body>
              Cards interativos possuem elevação ao passar o mouse.
            </Card.Body>
            <Card.Footer>
              <Button size="sm" variant="ghost">Cancelar</Button>
              <Button size="sm">Salvar</Button>
            </Card.Footer>
          </Card>
        </div>
      </section>

      {/* ═══ BANNER ═══ */}
      <section className="showcase__section">
        <h2>Banner</h2>
        <p>Mensagens contextuais com 4 tons.</p>
        <div style={{ maxWidth: 500 }}>
          <Banner tone="error">Erro: Não foi possível conectar ao servidor.</Banner>
          <Banner tone="success">Chamado atualizado com sucesso!</Banner>
          <Banner tone="warning">Atenção: Sua sessão expira em 5 minutos.</Banner>
          <Banner tone="info">Você tem 3 novos chamados aguardando atendimento.</Banner>
        </div>
      </section>

      {/* ═══ FORM FIELDS ═══ */}
      <section className="showcase__section">
        <h2>Field / Select / Textarea</h2>
        <p>Campos de formulário padronizados.</p>
        <div className="showcase__form-demo">
          <Field
            id="demo-email"
            label="E-mail"
            icon={Mail}
            type="email"
            placeholder="usuario@empresa.com"
          />
          <Field
            id="demo-password"
            label="Senha"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            error="A senha deve ter ao menos 6 caracteres."
          />
          <Field
            id="demo-search"
            label="Sem ícone"
            placeholder="Campo sem ícone à esquerda"
          />
          <Select
            id="demo-category"
            label="Categoria"
            icon={Tag}
            placeholder="Selecione uma categoria"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            options={[
              { value: "hardware", label: "Hardware" },
              { value: "software", label: "Software" },
              { value: "rede", label: "Rede" },
              { value: "acesso", label: "Acesso" },
            ]}
          />
          <Textarea
            id="demo-desc"
            label="Descrição Detalhada"
            placeholder="Descreva o problema com o máximo de detalhes possível..."
            maxLength={500}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
        </div>
      </section>

      {/* ═══ FILE UPLOAD ═══ */}
      <section className="showcase__section">
        <h2>FileUpload</h2>
        <p>Zona de upload com drag & drop.</p>
        <div className="showcase__form-demo">
          <FileUpload
            label="Anexos (Opcional)"
            files={files}
            onFilesChange={setFiles}
          />
        </div>
      </section>

      {/* ═══ TABLE ═══ */}
      <section className="showcase__section">
        <h2>Table</h2>
        <p>Tabela de dados com badges inline, header sticky e hover.</p>
        <Card>
          <Card.Header title="Meus Chamados Recentes" action={<Button size="sm" variant="ghost">Ver todos →</Button>} />
          <Card.Body compact>
            <Table
              columns={tableColumns}
              data={sampleTableData}
              clickable
              onRowClick={(row) => alert(`Clicou em ${row.id}`)}
            />
          </Card.Body>
          <Card.Footer>
            <Pagination
              page={page}
              totalPages={4}
              totalItems={12}
              pageSize={3}
              onPageChange={setPage}
            />
          </Card.Footer>
        </Card>
      </section>

      {/* ═══ EMPTY STATE ═══ */}
      <section className="showcase__section">
        <h2>EmptyState</h2>
        <p>Feedback visual quando não há dados.</p>
        <Card>
          <EmptyState
            icon={Inbox}
            title="Nenhum chamado encontrado"
            description="Não há chamados correspondentes aos filtros selecionados. Tente ajustar os filtros."
            action={<Button size="sm" icon={Plus}>Novo Chamado</Button>}
          />
        </Card>
      </section>

      {/* ═══ MODAL ═══ */}
      <section className="showcase__section">
        <h2>Modal</h2>
        <p>Dialog com overlay, animações e tamanhos.</p>
        <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirmar Ação"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="danger" icon={Trash2} onClick={() => setModalOpen(false)}>Excluir</Button>
            </>
          }
        >
          <p style={{ color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
            Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita e todos os comentários e anexos associados serão removidos permanentemente.
          </p>
        </Modal>
      </section>

      {/* ═══ TOKENS ═══ */}
      <section className="showcase__section">
        <h2>Design Tokens — Cores</h2>
        <p>Paleta de cores do sistema.</p>

        <div className="showcase__label">Brand</div>
        <div className="showcase__row">
          {[
            { var: "--color-primary", label: "Primary" },
            { var: "--color-primary-hover", label: "Primary Hover" },
            { var: "--color-primary-light", label: "Primary Light" },
          ].map((c) => (
            <div key={c.var} style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: `var(${c.var})`, border: "1px solid var(--color-border)", margin: "0 auto 4px" }} />
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div className="showcase__label">Semânticas</div>
        <div className="showcase__row">
          {[
            { var: "--color-success", label: "Success" },
            { var: "--color-warning", label: "Warning" },
            { var: "--color-error", label: "Error" },
            { var: "--color-info", label: "Info" },
          ].map((c) => (
            <div key={c.var} style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: `var(${c.var})`, margin: "0 auto 4px" }} />
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div className="showcase__label">Sidebar</div>
        <div className="showcase__row">
          {[
            { var: "--color-sidebar-bg", label: "Sidebar BG" },
            { var: "--color-sidebar-active", label: "Sidebar Active" },
          ].map((c) => (
            <div key={c.var} style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: `var(${c.var})`, margin: "0 auto 4px" }} />
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DesignSystemShowcase;
