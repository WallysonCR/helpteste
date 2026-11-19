import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, Table, PriorityBadge, StatusBadge, Field, Select, Pagination } from "../../../shared/components";
import { ticketsApi } from "../../../lib/api";
import "./MyTicketsScreen.css";

const PAGE_SIZE = 10;

function QueueScreen() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Aberto");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await ticketsApi.listar({
          page,
          pageSize: PAGE_SIZE,
          status: statusFilter || undefined,
          search: search || undefined,
        });
        setTickets(data.items);
        setTotal(data.total);
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
    { key: "nomeAgente", label: "Responsável", cellClass: "ht-table__cell--muted", render: (val) => val ?? "Nenhum" },
    { key: "prioridade", label: "Prioridade", render: (val) => <PriorityBadge priority={val?.toLowerCase()} size="sm" /> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val?.toLowerCase()} size="sm" /> },
  ];

  return (
    <div className="my-tickets-screen">
      <header className="my-tickets-screen__header">
        <div>
          <h1 className="my-tickets-screen__title">Fila Geral de Atendimento</h1>
          <p className="my-tickets-screen__subtitle">Visão de todos os chamados abertos e em andamento.</p>
        </div>
      </header>

      <div className="my-tickets-screen__filters">
        <div style={{ flex: 1 }}>
          <Field
            id="q-search"
            placeholder="Buscar na fila por título..."
            icon={Search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={{ width: "200px" }}>
          <Select
            id="q-status"
            icon={Filter}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: "Aberto", label: "Apenas Abertos" },
              { value: "EmAtendimento", label: "Em Atendimento" },
              { value: "", label: "Todos da Fila" },
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
          <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </Card.Footer>
      </Card>
    </div>
  );
}

export default QueueScreen;
