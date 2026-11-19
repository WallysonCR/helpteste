import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import "./Banner.css";

const ICONS = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

function Banner({ tone = "error", children }) {
  if (!children) return null;
  const Icon = ICONS[tone] || AlertCircle;
  return (
    <div className={`ht-banner ht-banner--${tone}`} role="alert">
      <Icon size={14} />
      <span>{children}</span>
    </div>
  );
}

export default Banner;
