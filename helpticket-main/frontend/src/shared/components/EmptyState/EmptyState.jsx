import { Inbox } from "lucide-react";
import "./EmptyState.css";

function EmptyState({ icon: Icon = Inbox, title = "Nenhum dado encontrado", description, action, className = "" }) {
  return (
    <div className={`ht-empty-state ${className}`}>
      <div className="ht-empty-state__icon">
        <Icon size={24} />
      </div>
      <div className="ht-empty-state__title">{title}</div>
      {description && <div className="ht-empty-state__description">{description}</div>}
      {action && <div className="ht-empty-state__action">{action}</div>}
    </div>
  );
}

export default EmptyState;
