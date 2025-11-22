import React from "react";
import { useTranslation } from "react-i18next";
import { daysOfWeekCallendarConfig } from "global/def";

interface CallendarDaysHeaderProps {
}

const CallendarDaysHeader: React.FC<CallendarDaysHeaderProps> = () => {

    const { t } = useTranslation();

    return (
        <div className="month-callendar">
            {daysOfWeekCallendarConfig.map((day) => (
                <div key={day} className="month-callendar-cell header-cell month-callendar-header">{t(`callendar.dayOfWeekLetter.${day}`)}</div>
            ))}
        </div>
    )
}

export default CallendarDaysHeader;