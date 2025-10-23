export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    total: number; // Total number of items
    limit: number; // Items per page
    onPageChange: (page: number) => void;
}

export interface PaginationProps2 {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}