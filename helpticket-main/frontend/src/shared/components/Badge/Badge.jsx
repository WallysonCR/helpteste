import "./Badge.css";

function Badge({ tone = "neutral", size = "md", dot = false, children, className = "" }) {
  return (
    <span className={`ht-badge ht-badge--${tone} ht-badge--${size} ${className}`}>
      {dot && <span className="ht-badge__dot" />}
      {children}
    </span>
  );
}

export default Badge;
