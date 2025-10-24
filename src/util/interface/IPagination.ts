export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number; 
    onPageChange: (page: number) => void;
}

export interface PaginationProps2 {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}