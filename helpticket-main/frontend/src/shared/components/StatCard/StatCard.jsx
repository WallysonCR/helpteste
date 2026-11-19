import "./StatCard.css";

function StatCard({ icon: Icon, label, value, subtitle, tone = "info", accent = false, className = "" }) {
  const classes = [
    "ht-stat-card",
    accent && `ht-stat-card--accent-${tone}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {Icon && (
        <div className={`ht-stat-card__icon ht-stat-card__icon--${tone}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="ht-stat-card__content">
        <div className="ht-stat-card__label">{label}</div>
        <div className="ht-stat-card__value">{value}</div>
        {subtitle && <div className="ht-stat-card__subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export default StatCard;
