import { DateRange } from "@shared/interfaces/EmployeeProfileI";
import React from "react";

interface CallendarsViewProps {
    range: DateRange;
}

const CallendarsView: React.FC<CallendarsViewProps> = ({ range }) => {
    return (
        <div className="w-full flex flex-col items-center gap-0 h-full justify-center">
            CALLENDAR VIEW
        </div>
    );
}

export default CallendarsView;