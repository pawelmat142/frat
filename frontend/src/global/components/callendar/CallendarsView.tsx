import { DateRange } from "@shared/interfaces/EmployeeProfileI";
import React from "react";
import Button from "global/components/controls/Button";

interface CallendarsViewProps {
    range: DateRange;
    onSubmit?: (result: DateRange) => void;
    onCancel?: () => void;
}

const CallendarsView: React.FC<CallendarsViewProps> = ({ range, onSubmit, onCancel }) => {
    return (
        <div className="w-full flex flex-col items-center gap-4 h-full justify-center p-2">
            <div>CALLENDAR VIEW</div>
            <div className="flex gap-2">
                {onCancel && (
                    <Button onClick={() => onCancel?.()}>Anuluj</Button>
                )}
                {onSubmit && (
                    <Button mode="primary" onClick={() => onSubmit?.(range)}>OK</Button>
                )}
            </div>
        </div>
    );
}

export default CallendarsView;