import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationFooterProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export function PaginationFooter({
    currentPage,
    pageSize,
    totalItems,
    onPageChange
}: PaginationFooterProps) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
            <div className="text-xs font-bold text-gray-500">
                Showing <span className="text-gray-900">{startItem}</span> to <span className="text-gray-900">{endItem}</span> of <span className="text-gray-900">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-500 border border-transparent hover:border-gray-200"
                    title="First Page"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-500 border border-transparent hover:border-gray-200"
                    title="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg text-xs font-black text-gray-700 min-w-[100px] justify-center">
                    Page {currentPage} of {totalPages}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-500 border border-transparent hover:border-gray-200"
                    title="Next Page"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-500 border border-transparent hover:border-gray-200"
                    title="Last Page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}
