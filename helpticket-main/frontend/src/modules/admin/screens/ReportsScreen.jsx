import { useEffect, useState } from "react";
import { Download, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, StatCard, Button } from "../../../shared/components";
import { ticketsApi } from "../../../lib/api";
import "./ReportsScreen.css";

function ReportsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsApi.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  const maxChartValue = Math.max(1, ...(stats?.porDia ?? []).map(d => d.quantidade));
  const total = stats?.total ?? 0;
  const resolvidos = stats?.resolvidos ?? 0
  const taxaResolucao = total > 0 ? Math.round((resolvidos / total) * 100) : 0;

  return (
    <div className="reports-screen">
      <header className="reports-screen__header">
        <div>
          <h1 className="reports-screen__title">Relatórios</h1>
          <p className="reports-screen__subtitle">Métricas de performance dos últimos 7 dias.</p>
        </div>
        <Button icon={Download} variant="outline" onClick={() => window.print()}>Exportar PDF</Button>
      </header>

      <div className="reports-screen__grid">
        <StatCard icon={TrendingUp} label="Total de Chamados" value={stats?.total ?? "—"} subtitle="Todos os chamados" tone="info" />
        <StatCard icon={CheckCircle} label="Taxa de Resolução" value={loading ? "—" : `${taxaResolucao}%`} subtitle="Resolvidos / Total" tone="success" />
        <StatCard icon={Clock} label="Em Atendimento" value={stats?.emAtendimento ?? "—"} subtitle="Aguardando ação" tone="warning" />
        <StatCard icon={AlertCircle} label="Abertos" value={stats?.abertos ?? "—"} subtitle="Sem resolução" tone="error" accent />
      </div>

      <div className="reports-screen__grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <Card>
          <Card.Header title="Chamados por Dia" subtitle="Volume dos últimos 7 dias" />
          <Card.Body>
            <div className="reports-chart">
              {(stats?.porDia ?? []).map((d) => (
                <div key={d.label} className="reports-chart__bar-wrapper">
                  <span className="reports-chart__value">{d.quantidade}</span>
                  <div
                    className="reports-chart__bar"
                    style={{ height: `${(d.quantidade / maxChartValue) * 100}%` }}
                    title={`${d.quantidade} chamados`}
                  />
                  <span className="reports-chart__label">{d.label}</span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header title="Chamados por Categoria" />
          <Card.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-2)" }}>
              {(stats?.porCategoria ?? []).map(cat => (
                <div key={cat.nome} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>{cat.nome}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)" }}>{cat.quantidade}</span>
                </div>
              ))}
              {!loading && (stats?.porCategoria ?? []).length === 0 && (
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Nenhum dado ainda.</span>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default ReportsScreen;
