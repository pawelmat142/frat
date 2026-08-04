import React from "react";
import { useTranslation } from "react-i18next";
import { Ico } from "global/icon.def";

const WorkersMapSearchResults: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
            <Ico.MAP size={64} className="secondary-text opacity-40" />
            <p className="xl-font secondary-text">
                {t('common.mapViewComingSoon', { defaultValue: 'Map view coming soon...' })}
            </p>
        </div>
    );
};

export default WorkersMapSearchResults;
