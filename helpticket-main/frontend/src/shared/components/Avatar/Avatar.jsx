import "./Avatar.css";

const COLORS = ["blue", "green", "orange", "purple", "red", "teal"];

function getColorFromName(name) {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, src, size = "md", status, color, className = "" }) {
  const autoColor = color || getColorFromName(name);
  const classes = [
    "ht-avatar",
    `ht-avatar--${size}`,
    !src && `ht-avatar--${autoColor}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} title={name} aria-label={name}>
      {src ? (
        <img src={src} alt={name || "avatar"} />
      ) : (
        getInitials(name)
      )}
      {status && <span className={`ht-avatar__status ht-avatar__status--${status}`} />}
    </div>
  );
}

export default Avatar;
