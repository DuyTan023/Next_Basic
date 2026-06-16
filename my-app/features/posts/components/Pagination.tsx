"use client";

// features/posts/components/Pagination.tsx

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  // Tạo danh sách trang với ellipsis
  const pages = buildPageList(page, totalPages);

  return (
    <>
      <style>{paginationStyles}</style>
      <nav className="pagination" aria-label="Phân trang">
        <button
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Trang trước"
        >
          ← Trước
        </button>

        {pages.map((item, i) =>
          item === "..." ? (
            <span key={`ellipsis-${i}`} className="page-ellipsis" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              className={`page-btn${page === item ? " active" : ""}`}
              onClick={() => onPageChange(item as number)}
              aria-label={`Trang ${item}`}
              aria-current={page === item ? "page" : undefined}
            >
              {item}
            </button>
          )
        )}

        <button
          className="page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Trang sau"
        >
          Sau →
        </button>
      </nav>
    </>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  const result: (number | "...")[] = [];
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === total || Math.abs(p - current) <= 1
  );

  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) result.push("...");
    result.push(pages[i]);
  }
  return result;
}

const paginationStyles = `
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 48px;
  }

  .page-btn {
    min-width: 40px;
    height: 40px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid #e8eaed;
    background: #fff;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.15s;
    font-family: inherit;
  }

  .page-btn:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #c7cdfb;
  }

  .page-btn.active {
    background: #5b6af0;
    color: #fff;
    border-color: #5b6af0;
    font-weight: 700;
  }

  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-ellipsis {
    color: #9ca3af;
    font-size: 14px;
    padding: 0 4px;
  }
`;