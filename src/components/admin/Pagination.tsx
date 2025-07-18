import React from 'react'

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({currentPage, totalPages, onPageChange}) => {
  return (
    <div className="flex justify-end items-center gap-2 mt-4 px-4">
        <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-1 border rounded disabled:opacity-50"
        >Previous</button>

        {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-1 border rounded ${
                    page === currentPage ? 'bg-blue-600 text-white' : 'bg-white'
                    }`}
                >{page}</button>
            )
        })}

        <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-1 border rounded disabled:opacity-50"
        >Next</button>
    </div>
  )
}

export default Pagination
