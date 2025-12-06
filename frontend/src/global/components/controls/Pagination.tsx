import React from "react";
import { BtnModes } from "global/interface/controls.interface";
import Button from "global/components/controls/Button";
import { useTranslation } from "react-i18next";
import { PaginationI } from "@shared/interfaces/Others";

interface PaginationProps {
    pagination: PaginationI;
    onPrev: () => void;
    onNext: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPrev, onNext }) => {
    const { t } = useTranslation();
    if (!pagination?.totalPages) {
        return null;
    }
    return (
        <div className="flex-[2] flex justify-center items-center gap-4 mt-5 mb-10">
            <Button
                mode={BtnModes.PRIMARY_TXT}
                onClick={onPrev}
                disabled={pagination.currentPage === 1}
            >
                {t('common.previous')}
            </Button>
            <span className="secondary-text whitespace-nowrap">
                {t('common.page')} {pagination.currentPage} {t('common.of')} {pagination.totalPages} ({pagination.count} {t('common.items')})
            </span>
            <Button
                mode={BtnModes.PRIMARY_TXT}
                onClick={onNext}
                disabled={pagination.currentPage === pagination.totalPages}
            >
                {t('common.next')}
            </Button>
        </div>
    );
};

export default Pagination;
