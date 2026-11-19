import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Card, Table, Button, Badge, Modal, Field, Select, Avatar, Pagination } from "../../../shared/components";
import { usuariosApi } from "../../../lib/api";
import "./UsersScreen.css";

const PAGE_SIZE = 10;

const roleMap = {
  Administrador: { label: "Administrador", tone: "error" },
  Agente: { label: "Agente", tone: "info" },
  Solicitante: { label: "Cliente", tone: "neutral" },
};

function UsersScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ nome: "", email: "", tipo: "Solicitante", status: "ativo", senha: "" });

  useEffect(() => {
    usuariosApi.listar().then(setUsuarios);
  }, []);

  const openNewUserModal = () => {
    setSelectedUser(null);
    setFormData({ nome: "", email: "", tipo: "Solicitante", status: "ativo", senha: "" });
    setModalOpen(true);
  };

  const openEditUserModal = (user) => {
    setSelectedUser(user);
    setFormData({ nome: user.nome, email: user.email, tipo: user.tipo, status: user.status, senha: "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedUser) {
        await usuariosApi.atualizar(selectedUser.idUsuario, formData);
        setUsuarios(prev => prev.map(u => u.idUsuario === selectedUser.idUsuario ? { ...u, ...formData } : u));
      } else {
        const novo = await usuariosApi.criar(formData);
        setUsuarios(prev => [...prev, novo]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await usuariosApi.deletar(id);
    setUsuarios(prev => prev.filter(u => u.idUsuario !== id));
  };

  const columns = [
    {
      key: "nome",
      label: "Usuário",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Avatar name={val} size="sm" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: "var(--weight-medium)", color: "var(--color-text-primary)" }}>{val}</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: "tipo",
      label: "Perfil",
      render: (val) => <Badge tone={roleMap[val]?.tone ?? "neutral"}>{roleMap[val]?.label ?? val}</Badge>
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge tone={val === "ativo" ? "success" : "neutral"} dot>
          {val === "ativo" ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "",
      cellClass: "ht-table__cell--actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" icon={Edit2} iconOnly onClick={(e) => { e.stopPropagation(); openEditUserModal(row); }} />
          <Button variant="ghost" size="sm" icon={Trash2} iconOnly onClick={(e) => { e.stopPropagation(); handleDelete(row.idUsuario); }} style={{ color: "var(--color-error)" }} />
        </div>
      )
    }
  ];

  return (
    <div className="users-screen">
      <header className="users-screen__header">
        <div>
          <h1 className="users-screen__title">Usuários</h1>
          <p className="users-screen__subtitle">Gerenciamento de clientes, agentes e administradores.</p>
        </div>
        <Button icon={Plus} onClick={openNewUserModal}>Novo Usuário</Button>
      </header>

      <Card>
        <Card.Body>
          <Table
            columns={columns}
            data={usuarios.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
            clickable
            onRowClick={(row) => openEditUserModal(row)}
          />
        </Card.Body>
        <Card.Footer>
          <Pagination page={page} totalPages={Math.ceil(usuarios.length / PAGE_SIZE)} totalItems={usuarios.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </Card.Footer>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedUser ? "Editar Usuário" : "Novo Usuário"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>Salvar Usuário</Button>
          </>
        }
      >
        <div className="users-screen__form-grid">
          <Field id="nome" label="Nome Completo" value={formData.nome} onChange={(e) => setFormData(p => ({ ...p, nome: e.target.value }))} />
          <Field id="email" label="E-mail" type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
          {!selectedUser && (
            <Field id="senha" label="Senha" type="password" value={formData.senha} onChange={(e) => setFormData(p => ({ ...p, senha: e.target.value }))} />
          )}
          <Select
            id="perfil"
            label="Perfil de Acesso"
            value={formData.tipo}
            onChange={(e) => setFormData(p => ({ ...p, tipo: e.target.value }))}
            options={[
              { value: "Solicitante", label: "Cliente" },
              { value: "Agente", label: "Agente de Suporte" },
              { value: "Administrador", label: "Administrador" },
            ]}
          />
          <Select
            id="status"
            label="Status da Conta"
            value={formData.status}
            onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
            options={[
              { value: "ativo", label: "Ativa" },
              { value: "inativo", label: "Inativa" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}

export default UsersScreen;
