import { ChevronDown, AlertCircle } from "lucide-react";
import "./Select.css";

function Select({ id, label, icon: Icon, options = [], placeholder, error, value, className = "", ...selectProps }) {
  const hasIcon = !!Icon;
  const isPlaceholderSelected = !value || value === "";

  return (
    <div className={`ht-select ${className}`}>
      {label && <label htmlFor={id} className="ht-select__label">{label}</label>}
      <div className={`ht-select__wrapper ${hasIcon ? "ht-select__wrapper--has-icon" : ""}`}>
        {hasIcon && <Icon className="ht-select__icon" size={16} />}
        <select
          id={id}
          value={value}
          className={`ht-select__input ${error ? "ht-select__input--error" : ""} ${isPlaceholderSelected ? "ht-select__input--placeholder" : ""}`}
          {...selectProps}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="ht-select__chevron" size={16} />
      </div>
      {error && (
        <div className="ht-select__error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default Select;
