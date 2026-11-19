import { AlertCircle } from "lucide-react";
import "./Textarea.css";

function Textarea({ id, label, error, maxLength, value = "", className = "", ...textareaProps }) {
  const count = value.length;
  const isOverLimit = maxLength && count > maxLength;

  return (
    <div className={`ht-textarea ${className}`}>
      {label && <label htmlFor={id} className="ht-textarea__label">{label}</label>}
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        className={`ht-textarea__input ${error ? "ht-textarea__input--error" : ""}`}
        {...textareaProps}
      />
      <div className="ht-textarea__footer">
        {error && (
          <div className="ht-textarea__error">
            <AlertCircle size={13} />
            <span>{error}</span>
          </div>
        )}
        {maxLength && (
          <span className={`ht-textarea__count ${isOverLimit ? "ht-textarea__count--limit" : ""}`}>
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

export default Textarea;
