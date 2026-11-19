import { AlertCircle } from "lucide-react";
import "./Field.css";

function Field({ id, label, icon: Icon, error, rightSlot, headerExtra, className = "", ...inputProps }) {
  const hasIcon = !!Icon;
  return (
    <div className={`ht-field ${!hasIcon ? "ht-field--no-icon" : ""} ${className}`}>
      {(label || headerExtra) && (
        <div className="ht-field__header">
          {label && <label htmlFor={id} className="ht-field__label">{label}</label>}
          {headerExtra}
        </div>
      )}
      <div className="ht-field__input-wrapper">
        {hasIcon && <Icon className="ht-field__icon" size={16} />}
        <input
          id={id}
          {...inputProps}
          className={`ht-field__input ${error ? "ht-field__input--error" : ""}`}
        />
        {rightSlot && <div className="ht-field__right-slot">{rightSlot}</div>}
      </div>
      {error && (
        <div className="ht-field__error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default Field;
