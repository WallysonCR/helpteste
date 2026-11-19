import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./Modal.css";

function Modal({ open, onClose, title, size = "md", children, footer }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div className="ht-modal__overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`ht-modal ht-modal--${size}`} role="dialog" aria-modal="true" aria-label={title}>
        {title && (
          <div className="ht-modal__header">
            <h2 className="ht-modal__title">{title}</h2>
            <button className="ht-modal__close" onClick={onClose} aria-label="Fechar">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="ht-modal__body">{children}</div>
        {footer && <div className="ht-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
