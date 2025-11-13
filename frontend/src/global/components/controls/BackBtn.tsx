import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const BackBtn: React.FC = () => {

    const navigate = useNavigate()

    const goBack = () => {
        navigate(-1)
    }

    return (
        <Button onClick={() => goBack()} mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} className="ripple mb-2">
            ← Back
        </Button>
    )
}

export default BackBtn;
