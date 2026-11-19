import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

function getVisiblePages(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange, className = "" }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className={`ht-pagination ${className}`}>
      <span className="ht-pagination__info">
        Mostrando {from} a {to} de {totalItems} resultados
      </span>
      <div className="ht-pagination__controls">
        <button
          className="ht-pagination__btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>
        {visiblePages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="ht-pagination__ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`ht-pagination__btn ${p === page ? "ht-pagination__btn--active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-label={`Página ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          className="ht-pagination__btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
