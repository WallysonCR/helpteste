import Badge from "../Badge/Badge";

const PRIORITY_MAP = {
  baixa:   { label: "Baixa",   tone: "success" },
  media:   { label: "Média",   tone: "warning" },
  alta:    { label: "Alta",    tone: "error"   },
  critica: { label: "Crítica", tone: "error"   },
};

function PriorityBadge({ priority, size = "md", className = "" }) {
  const config = PRIORITY_MAP[priority] || { label: priority, tone: "neutral" };
  return (
    <Badge tone={config.tone} size={size} className={className}>
      {config.label}
    </Badge>
  );
}

export default PriorityBadge;
