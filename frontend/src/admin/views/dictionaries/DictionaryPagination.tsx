import React from 'react';
import Button from 'global/components/controls/Button';
import { BtnModes } from 'global/interface/controls.interface';

interface Props {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

const DictionaryPagination: React.FC<Props> = ({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
}) => {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-end items-center gap-4 mb-4">
            <Button
                mode={BtnModes.PRIMARY_TXT}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </Button>
            <span className="secondary-text whitespace-nowrap">
                Page {currentPage} of {totalPages} ({totalItems} total items)
            </span>
            <Button
                mode={BtnModes.PRIMARY_TXT}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    );
};

export default DictionaryPagination;
