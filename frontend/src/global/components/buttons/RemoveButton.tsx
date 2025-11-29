import { BtnMode, BtnModes } from "global/interface/controls.interface";
import Button from "../controls/Button";
import { FaTimesCircle } from "react-icons/fa";

interface EditButtonProps {
    onClick: () => void;
    label?: string;
    mode?: BtnMode;
}

const RemoveButton: React.FC<EditButtonProps> = ({ onClick, label, mode = BtnModes.PRIMARY_TXT }) => {

    return (
        <Button onClick={onClick} mode={mode}>
            <span className="flex items-center justify-center gap-2">
                <FaTimesCircle />
                {label ? label : null }
            </span>
        </Button>
    )
}

export default RemoveButton;