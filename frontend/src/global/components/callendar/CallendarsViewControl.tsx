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
                >{Utils.formatDate(t, date, placeholder)}</div>
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