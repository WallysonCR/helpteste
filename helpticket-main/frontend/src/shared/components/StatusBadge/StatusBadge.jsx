import Badge from "../Badge/Badge";

const STATUS_MAP = {
  aberto:          { label: "Aberto",          tone: "info"    },
  novo:            { label: "Novo",            tone: "info"    },
  ematendimento:   { label: "Em Atendimento",  tone: "warning" },
  em_atendimento:  { label: "Em Atendimento",  tone: "warning" },
  em_andamento:    { label: "Em Andamento",    tone: "warning" },
  aguardando:      { label: "Aguardando",      tone: "neutral" },
  resolvido:       { label: "Resolvido",       tone: "success" },
  fechado:         { label: "Fechado",         tone: "neutral" },
};

function StatusBadge({ status, size = "md", className = "" }) {
  const config = STATUS_MAP[status] || { label: status, tone: "neutral" };
  return (
    <Badge tone={config.tone} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}

export default StatusBadge;
