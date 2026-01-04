import { DateUtil } from "@shared/utils/DateUtil";
import RemoveButton from "../buttons/RemoveButton";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";



interface CallendarsViewControlProps {
    onFocus?: () => void;
    selected?: boolean;
    /** Local date string in YYYY-MM-DD format */
    date?: string | null;
    placeholder: string;
    label: string;
    id: string;
    onRemove?: () => void;
    injectRightComponent?: React.ReactNode;
}

const CallendarsViewControl: React.FC<CallendarsViewControlProps> = ({
    onFocus,
    selected,
    date,
    placeholder,
    label,
    id,
    onRemove,
    injectRightComponent
}) => {

    const inputRef = useRef<HTMLInputElement | null>(null);

    const { t } = useTranslation();

    useEffect(() => {
        if (selected && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selected]);

    const formatDate = (dateStr?: string | null, placeholder?: string): string => {
        if (!dateStr) return placeholder || '';
        const date = DateUtil.parseLocalDateString(dateStr);
        const dayFull = t(`callendar.dayOfWeekFull.${date.getDay()}`);
        const dayNumber = date.getDate();
        const monthFull = t(`callendar.monthShort.${date.getMonth()}`);
        return `${dayFull}, ${dayNumber} ${monthFull}`;
    }

    return (
        <div className={`pp-control callendar-view ${selected ? 'focus' : ''}${!date && !selected ? ' empty' : ''}`}>
            <div className="callendar-view-row">
                <div className="callendar-view-label">
                    <label htmlFor={id} className="">{label}</label>
                </div>
                <div
                    onClick={onFocus}
                    className={`callendar-view-input`}
                    ref={inputRef}
                >{formatDate(date, placeholder)}</div>
                {!!date && (
                    <div className="callendar-view-btn">
                        <RemoveButton onClick={() => onRemove?.()}></RemoveButton>
                    </div>
                )}
                {!!injectRightComponent && (
                    <div className="callendar-view-right-inject">{injectRightComponent}</div>
                )}

            </div>
        </div>
    );
}

export default CallendarsViewControl;