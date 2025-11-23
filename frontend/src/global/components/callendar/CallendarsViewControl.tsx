import { Util } from "@shared/utils/util";
import { useTranslation } from "react-i18next";
import RemoveButton from "../buttons/RemoveButton";

interface CallendarsViewControlProps {
    onFocus?: () => void;
    selected?: boolean;
    date?: Date | null;
    placeholder: string;
    label: string
    id: string
    onRemove?: () => void;
}

const CallendarsViewControl: React.FC<CallendarsViewControlProps> = ({
    onFocus,
    selected,
    date,
    placeholder,
    label, id,
    onRemove
}) => {

    const prepareDisplayValue = (date?: Date | null): string => {
        if (!date) return placeholder;
        return Util.displayDate(date)
    }

    return (
        <div className={`pp-control callendar-view`}>
            <div className="callendar-view-row">
                <div className="callendar-view-label">
                    <label htmlFor={id} className="">{label}</label>
                </div>
                <input
                    type="text"
                    value={prepareDisplayValue(date)}
                    onFocus={onFocus}
                    className={`callendar-view-input`}
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