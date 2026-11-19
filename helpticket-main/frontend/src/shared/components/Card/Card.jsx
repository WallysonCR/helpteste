import "./Card.css";

function Card({ children, interactive = false, flat = false, noBorder = false, className = "", ...props }) {
  const classes = [
    "ht-card",
    interactive && "ht-card--interactive",
    flat && "ht-card--flat",
    noBorder && "ht-card--no-border",
    className,
  ].filter(Boolean).join(" ");

  return <div className={classes} {...props}>{children}</div>;
}

function CardHeader({ title, subtitle, children, action }) {
  return (
    <div className="ht-card__header">
      <div>
        {title && <div className="ht-card__header-title">{title}</div>}
        {subtitle && <div className="ht-card__header-subtitle">{subtitle}</div>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function CardBody({ children, compact = false, className = "" }) {
  return (
    <div className={`ht-card__body ${compact ? "ht-card__body--compact" : ""} ${className}`}>
      {children}
    </div>
  );
}

function CardFooter({ children }) {
  return <div className="ht-card__footer">{children}</div>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
