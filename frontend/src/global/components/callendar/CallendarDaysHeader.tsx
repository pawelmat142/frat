import React from "react";
import { useTranslation } from "react-i18next";
import { daysOfWeekCallendarConfig } from "global/def";

interface CallendarDaysHeaderProps {
    fullScreenMode: boolean;
}

const CallendarDaysHeader: React.FC<CallendarDaysHeaderProps> = ({ fullScreenMode}) => {

    const { t } = useTranslation();

    return (
        <div className="month-callendar">
            {daysOfWeekCallendarConfig.map((day) => (
                fullScreenMode ? (
                    <div key={day} className={`month-callendar-cell header-cell month-callendar-header${fullScreenMode ? ' big' : ''}`}>{t(`callendar.dayOfWeekThreeLetter.${day}`)}</div>
                ) : (
                    <div key={day} className="month-callendar-cell header-cell month-callendar-header">{t(`callendar.dayOfWeekLetter.${day}`)}</div>
                )
            ))}
        </div>
    )
}

export default CallendarDaysHeader;