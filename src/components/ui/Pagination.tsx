"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[]; // 0 = Semua
  itemName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemName = "data",
}: PaginationProps) {
  const showAll = itemsPerPage >= totalItems && totalItems > 0;
  const startIdx = showAll ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = showAll ? totalItems : Math.min(currentPage * itemsPerPage, totalItems);

  const selectStyle: React.CSSProperties = {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--navy-900)",
    background: "var(--cream-50)",
    border: "1px solid var(--gold-600)",
    padding: "4px 24px 4px 10px",
    borderRadius: 6,
    cursor: "pointer",
    outline: "none",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderTop: "1px solid rgba(160,125,47,.2)",
        background: "rgba(255,248,210,.35)",
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 16,
        color: "var(--ink-soft)",
        gap: 12,
        flexWrap: "wrap",
      }}
      className="max-[600px]:flex-col max-[600px]:gap-4 max-[600px]:items-center"
    >
      {/* Left: info + page size selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span>
          Menampilkan {totalItems === 0 ? 0 : startIdx}–{endIdx} dari {totalItems} {itemName}
        </span>

        {onPageSizeChange && (
          <div style={{ position: "relative", display: "inline-block" }}>
            <select
              value={itemsPerPage >= totalItems && totalItems > 0 ? 0 : itemsPerPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                onPageSizeChange(val === 0 ? (totalItems || 999999) : val);
                onPageChange(1);
              }}
              style={selectStyle}
              title="Jumlah baris per halaman"
            >
              <option value={0} style={{ background: "var(--cream-50)", color: "var(--navy-900)" }}>Semua</option>
              {pageSizeOptions.map((s) => (
                <option key={s} value={s} style={{ background: "var(--cream-50)", color: "var(--navy-900)" }}>
                  {s}
                </option>
              ))}
            </select>
            {/* custom arrow */}
            <span
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--gold-600)",
                fontSize: 10,
              }}
            >
              ▾
            </span>
          </div>
        )}
      </div>

      {/* Right: page buttons — hide when showing all */}
      {totalPages > 1 && !(itemsPerPage >= totalItems && totalItems > 0) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 11,
              letterSpacing: "1.5px",
              color: currentPage === 1 ? "var(--cream-300)" : "var(--gold-100)",
              background: "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
              border: "1px solid var(--gold-600)",
              padding: "7px 18px",
              borderRadius: 999,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
              transition: "opacity .2s",
            }}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => {
            if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
              if (p === 2 || p === totalPages - 1) return <span key={p} style={{ padding: "0 4px" }}>...</span>;
              return null;
            }
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: 11,
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: p === currentPage ? "1.5px solid var(--gold-400)" : "1px solid var(--gold-600)",
                  background: p === currentPage
                    ? "linear-gradient(180deg, var(--gold-500), var(--gold-600))"
                    : "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
                  color: "var(--cream-100)",
                  cursor: "pointer",
                  fontWeight: p === currentPage ? 700 : 400,
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 11,
              letterSpacing: "1.5px",
              color: currentPage === totalPages ? "var(--cream-300)" : "var(--gold-100)",
              background: "linear-gradient(180deg, var(--navy-700), var(--navy-900))",
              border: "1px solid var(--gold-600)",
              padding: "7px 18px",
              borderRadius: 999,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
              transition: "opacity .2s",
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
