import IconButton from "global/components/controls/IconButon";
import { BtnModes } from "global/interface/controls.interface";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type HeaderBackBtnProps = {
    onBack?: () => void;
};

const HeaderBackBtn: React.FC<HeaderBackBtnProps> = ({ onBack }) => {
    const navigate = useNavigate();

    return (
        <div className="logo cursor-pointer">
            <IconButton mode={BtnModes.SECONDARY_TXT}
                icon={<FaArrowLeft size={22} className='p-0' />}
                onClick={() => { onBack ? onBack() : navigate(-1); }}
            />
        </div>
    );
};

export default HeaderBackBtn;

