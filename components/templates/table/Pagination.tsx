// components/Pagination.tsx
import React from "react";
import { Button } from "react-bootstrap";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="d-flex justify-content-center align-items-center gap-1 mt-3">
      <Button
        size="sm"
        variant="outline-secondary"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(1)}
      >
        <i className="bi bi-chevron-double-left" />
      </Button>

      <Button
        size="sm"
        variant="outline-secondary"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="bi bi-chevron-left" />
      </Button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted">
            ...
          </span>
        ) : (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? "primary" : "outline-secondary"}
            onClick={() => onPageChange(page as number)}
            disabled={isLoading}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        size="sm"
        variant="outline-secondary"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <i className="bi bi-chevron-right" />
      </Button>

      <Button
        size="sm"
        variant="outline-secondary"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(totalPages)}
      >
        <i className="bi bi-chevron-double-right" />
      </Button>
    </div>
  );
}

function getVisiblePages(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
}
