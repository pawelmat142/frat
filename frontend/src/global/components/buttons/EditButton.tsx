import { BtnModes } from "global/interface/controls.interface";
import Button from "../controls/Button";
import { FaEdit } from "react-icons/fa";

interface EditButtonProps {
    onClick: () => void;
    label?: string;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, label }) => {

    return (
        <Button onClick={onClick} mode={BtnModes.PRIMARY_TXT} fullWidth>
            <span className="flex items-center justify-center gap-2">
                <FaEdit />
                {label ? label : null }
            </span>
        </Button>
    )
}

export default EditButton;