import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface DataTablePaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

export function DataTablePagination({
    currentPage,
    lastPage,
    onPageChange,
}: DataTablePaginationProps) {
    if (lastPage <= 1) return null;

    return (
        <div className="mt-4 flex justify-center">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() =>
                                currentPage > 1 &&
                                onPageChange(currentPage - 1)
                            }
                            className={
                                currentPage === 1
                                    ? 'pointer-events-none opacity-50'
                                    : 'cursor-pointer'
                            }
                        />
                    </PaginationItem>

                    {(() => {
                        const pages: React.ReactNode[] = [];
                        const maxVisible = 5;
                        let startPage = Math.max(1, currentPage - 2);
                        const endPage = Math.min(
                            lastPage,
                            startPage + maxVisible - 1,
                        );

                        if (endPage - startPage < maxVisible - 1) {
                            startPage = Math.max(
                                1,
                                endPage - maxVisible + 1,
                            );
                        }

                        if (startPage > 1) {
                            pages.push(
                                <PaginationItem key="page-1">
                                    <PaginationLink
                                        onClick={() => onPageChange(1)}
                                        className="cursor-pointer"
                                    >
                                        1
                                    </PaginationLink>
                                </PaginationItem>,
                            );
                            if (startPage > 2) {
                                pages.push(
                                    <PaginationItem key="ellipsis-start">
                                        <PaginationEllipsis />
                                    </PaginationItem>,
                                );
                            }
                        }

                        for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                                <PaginationItem key={`page-${i}`}>
                                    <PaginationLink
                                        onClick={() => onPageChange(i)}
                                        isActive={i === currentPage}
                                        className="cursor-pointer"
                                    >
                                        {i}
                                    </PaginationLink>
                                </PaginationItem>,
                            );
                        }

                        if (endPage < lastPage) {
                            if (endPage < lastPage - 1) {
                                pages.push(
                                    <PaginationItem key="ellipsis-end">
                                        <PaginationEllipsis />
                                    </PaginationItem>,
                                );
                            }
                            pages.push(
                                <PaginationItem key={`page-${lastPage}`}>
                                    <PaginationLink
                                        onClick={() => onPageChange(lastPage)}
                                        className="cursor-pointer"
                                    >
                                        {lastPage}
                                    </PaginationLink>
                                </PaginationItem>,
                            );
                        }

                        return pages;
                    })()}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                currentPage < lastPage &&
                                onPageChange(currentPage + 1)
                            }
                            className={
                                currentPage === lastPage
                                    ? 'pointer-events-none opacity-50'
                                    : 'cursor-pointer'
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
