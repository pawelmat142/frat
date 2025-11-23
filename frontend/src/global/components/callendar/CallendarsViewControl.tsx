import { Utils } from "global/utils";
import RemoveButton from "../buttons/RemoveButton";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface CallendarsViewControlProps {
    onFocus?: () => void;
    selected?: boolean;
    date?: Date | null;
    placeholder: string;
    label: string;
    id: string;
    onRemove?: () => void;
}

const CallendarsViewControl: React.FC<CallendarsViewControlProps> = ({
    onFocus,
    selected,
    date,
    placeholder,
    label,
    id,
    onRemove
}) => {

    const inputRef = useRef<HTMLInputElement | null>(null);

    const { t } = useTranslation();

    useEffect(() => {
        if (selected && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selected]);

    return (
        <div className={`pp-control callendar-view ${selected ? 'focus' : ''}${!date && !selected ? ' empty' : ''}`}>
            <div className="callendar-view-row">
                <div className="callendar-view-label">
                    <label htmlFor={id} className="">{label}</label>
                </div>
                <input
                    type="text"
                    value={Utils.formatDate(t, date, placeholder)}
                    onFocus={onFocus}
                    className={`callendar-view-input`}
                    ref={inputRef}
                    readOnly
                />
                {!!date && (
                    <div className="callendar-view-btn">
                        <RemoveButton onClick={() => onRemove?.()}></RemoveButton>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CallendarsViewControl;