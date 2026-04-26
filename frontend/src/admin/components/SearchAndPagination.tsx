import React from 'react';
import Button from 'global/components/controls/Button';
import FloatingInput from 'global/components/controls/FloatingInput';
import { BtnModes } from 'global/interface/controls.interface';

interface Props {
    searchText: string;
    onSearchChange: (text: string) => void;
    searchLabel?: string;
    currentPage: number;
    totalPages: number;
    filteredCount: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

const SearchAndPagination: React.FC<Props> = ({
    searchText,
    onSearchChange,
    searchLabel = 'Search',
    currentPage,
    totalPages,
    filteredCount,
    totalItems,
    onPageChange,
}) => {
    const isFiltered = filteredCount < totalItems;
    const countLabel = isFiltered
        ? `${filteredCount} filtered items`
        : `${totalItems} items`;

    return (
        <div className="flex gap-4 mb-4 items-center">
            <div className="flex-[1]">
                <FloatingInput
                    name="search"
                    label={searchLabel}
                    fullWidth
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            {totalPages > 1 && (
                <div className="flex-[2] flex justify-end items-center gap-4">
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="secondary-text whitespace-nowrap">
                        Page {currentPage} of {totalPages} ({countLabel})
                    </span>
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SearchAndPagination;
