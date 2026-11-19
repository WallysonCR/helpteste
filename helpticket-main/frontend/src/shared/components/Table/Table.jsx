import "./Table.css";

function Table({ columns, data = [], loading = false, compact = false, striped = false, clickable = false, onRowClick, className = "" }) {
  const classes = [
    "ht-table",
    compact && "ht-table--compact",
    striped && "ht-table--striped",
    clickable && "ht-table--clickable",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className="ht-table-wrapper">
      <table className={classes}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`}>
                {columns.map((col) => (
                  <td key={col.key}>
                    <div className="ht-skeleton" style={{ height: "18px", width: col.key === "idTicket" ? "40px" : "80%" }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-text-secondary)" }}>
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id ?? row.idTicket ?? row.idUsuario ?? rowIndex}
                onClick={clickable ? () => onRowClick?.(row, rowIndex) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.cellClass || ""}>
                    {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
