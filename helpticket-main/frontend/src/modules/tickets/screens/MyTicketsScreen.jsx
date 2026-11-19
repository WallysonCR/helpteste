import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Table, Button, PriorityBadge, StatusBadge, Field, Select, Pagination } from "../../../shared/components";
import { ticketsApi } from "../../../lib/api";
import "./MyTicketsScreen.css";

const PAGE_SIZE = 10;

function MyTicketsScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(queryParam);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(queryParam);
    setPage(1);
  }, [queryParam]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem("helpticket_user") || "{}");
        const isSolicitante = storedUser.tipoUsuario === "Solicitante";
        const isAgente = storedUser.tipoUsuario === "Agente";

        const data = await ticketsApi.listar({
          page,
          pageSize: PAGE_SIZE,
          status: statusFilter || undefined,
          search: search || undefined,
          meus: isSolicitante || isAgente,
        });

        let items = data.items ?? [];
        if (isSolicitante && storedUser.nome) {
          items = items.filter(
            (t) =>
              t.idSolicitante === storedUser.idUsuario ||
              t.nomeSolicitante === storedUser.nome
          );
        } else if (isAgente && storedUser.nome) {
          items = items.filter(
            (t) =>
              t.idAgente === storedUser.idUsuario ||
              t.nomeAgente === storedUser.nome ||
              t.nomeSolicitante === storedUser.nome
          );
        }

        setTickets(items);
        setTotal(isSolicitante || isAgente ? items.length : data.total);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, search, statusFilter]);

  const columns = [
    { key: "idTicket", label: "ID", cellClass: "ht-table__cell--mono" },
    { key: "titulo", label: "Título" },
    { key: "nomeSolicitante", label: "Solicitante" },
    { key: "prioridade", label: "Prioridade", render: (val) => <PriorityBadge priority={val?.toLowerCase()} size="sm" /> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val?.toLowerCase()} size="sm" /> },
    { key: "dataAbertura", label: "Aberto em", cellClass: "ht-table__cell--muted", render: (val) => new Date(val).toLocaleDateString("pt-BR") },
  ];

  return (
    <div className="my-tickets-screen">
      <header className="my-tickets-screen__header">
        <div>
          <h1 className="my-tickets-screen__title">Meus Chamados</h1>
          <p className="my-tickets-screen__subtitle">Acompanhe e gerencie os chamados atribuídos a você.</p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/app/novo")}>Novo Chamado</Button>
      </header>

      <div className="my-tickets-screen__filters">
        <div style={{ flex: 1 }}>
          <Field
            id="search"
            placeholder="Buscar por Título..."
            icon={Search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={{ width: "200px" }}>
          <Select
            id="status-filter"
            icon={Filter}
            placeholder="Todos os status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: "Aberto", label: "Aberto" },
              { value: "EmAtendimento", label: "Em Atendimento" },
              { value: "Resolvido", label: "Resolvido" },
              { value: "Fechado", label: "Fechado" },
            ]}
          />
        </div>
      </div>

      <Card>
        <Card.Body>
          <Table
            columns={columns}
            data={tickets}
            loading={loading}
            clickable
            onRowClick={(row) => navigate(`/app/chamado/${row.idTicket}`)}
          />
        </Card.Body>
        <Card.Footer>
          <Pagination
            page={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </Card.Footer>
      </Card>
    </div>
  );
}

export default MyTicketsScreen;
