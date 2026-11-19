import "./Button.css";

function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  full = false,
  iconOnly = false,
  className = "",
  ...props
}) {
  const classes = [
    "ht-btn",
    `ht-btn--${variant}`,
    `ht-btn--${size}`,
    full && "ht-btn--full",
    loading && "ht-btn--loading",
    iconOnly && "ht-btn--icon-only",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="ht-btn__spinner" />
      ) : (
        <>
          {Icon && <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />}
          {!iconOnly && children}
          {IconRight && <IconRight size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />}
        </>
      )}
    </button>
  );
}

export default Button;
