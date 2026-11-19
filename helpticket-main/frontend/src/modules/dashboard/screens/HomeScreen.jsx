import { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard, Card, Table, Button, PriorityBadge, StatusBadge } from "../../../shared/components";
import { ticketsApi } from "../../../lib/api";
import "./HomeScreen.css";

function HomeScreen() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ abertos: 0, emAtendimento: 0, resolvidos: 0, criticos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("helpticket_user") || "{}");
        const isSolicitante = storedUser.tipoUsuario === "Solicitante";

        const [data, statsData] = await Promise.all([
          ticketsApi.listar({ page: 1, pageSize: isSolicitante ? 50 : 5, meus: isSolicitante }),
          ticketsApi.stats(),
        ]);

        let items = data.items ?? [];
        if (isSolicitante && storedUser.nome) {
          items = items.filter(
            (t) =>
              t.idSolicitante === storedUser.idUsuario ||
              t.nomeSolicitante === storedUser.nome
          );
        }

        setTickets(items.slice(0, 5));

        if (isSolicitante) {
          setStats({
            abertos: items.filter((t) => t.status === "Aberto").length,
            emAtendimento: items.filter((t) => t.status === "EmAtendimento").length,
            resolvidos: items.filter((t) => t.status === "Resolvido").length,
            criticos: items.filter((t) => t.prioridade === "Critica" && t.status !== "Fechado").length,
          });
        } else {
          setStats({
            abertos: statsData.abertos ?? 0,
            emAtendimento: statsData.emAtendimento ?? 0,
            resolvidos: statsData.resolvidos ?? 0,
            criticos: statsData.criticos ?? items.filter((t) => t.prioridade === "Critica").length,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tableColumns = [
    { key: "idTicket", label: "ID", cellClass: "ht-table__cell--mono" },
    { key: "titulo", label: "Título" },
    { key: "nomeSolicitante", label: "Solicitante" },
    { key: "prioridade", label: "Prioridade", render: (val) => <PriorityBadge priority={val?.toLowerCase()} size="sm" /> },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val?.toLowerCase()} size="sm" /> },
    { key: "dataAbertura", label: "Aberto em", cellClass: "ht-table__cell--muted", render: (val) => new Date(val).toLocaleDateString("pt-BR") },
  ];

  return (
    <div className="home-screen">
      <header className="home-screen__header">
        <h1 className="home-screen__title">Início</h1>
        <p className="home-screen__subtitle">Visão geral da sua fila de trabalho e indicadores de hoje.</p>
      </header>

      <section className="home-screen__stats-grid">
        <StatCard icon={ClipboardList} label="Em Aberto" value={stats.abertos} subtitle="Chamados na sua fila" tone="info" />
        <StatCard icon={Clock} label="Em Atendimento" value={stats.emAtendimento} subtitle="Aguardando sua ação" tone="warning" />
        <StatCard icon={CheckCircle} label="Resolvidos" value={stats.resolvidos} subtitle="Total resolvidos" tone="success" />
        <StatCard icon={AlertTriangle} label="Críticos" value={stats.criticos} subtitle="Ação imediata requerida" tone="error" accent />
      </section>

      <section>
        <Card>
          <Card.Header
            title="Chamados Recentes"
            action={<Button size="sm" variant="ghost" icon={ArrowRight} onClick={() => navigate("/app/meus-chamados")}>Ver todos</Button>}
          />
          <Card.Body compact>
            <Table
              columns={tableColumns}
              data={tickets}
              loading={loading}
              clickable
              onRowClick={(row) => navigate(`/app/chamado/${row.idTicket}`)}
            />
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}

export default HomeScreen;
