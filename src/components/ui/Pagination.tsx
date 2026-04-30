"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = "data",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

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
      }}
      className="max-[600px]:flex-col max-[600px]:gap-4 max-[600px]:items-center"
    >
      <span>
        Menampilkan {startIdx}–{endIdx} dari {totalItems} {itemName}
      </span>
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
          // simple truncation for many pages: 1, 2, 3, ..., 10
          // For now, let's show all pages since it's an internal admin. 
          // If > 10 pages, maybe we need truncation, but let's keep it simple.
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
    </div>
  );
}
