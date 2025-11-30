import IconButton from "global/components/controls/IconButon";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type HeaderBackBtnProps = {
    onBack?: () => void;
};

const HeaderBackBtn: React.FC<HeaderBackBtnProps> = ({ onBack }) => {
    const navigate = useNavigate();

    return (
        <div className="logo cursor-pointer">
            <IconButton
                icon={<FaArrowLeft size={32} className='primary-color' />}
                onClick={() => { onBack ? onBack() : navigate(-1); }}
            />
        </div>
    );
};

export default HeaderBackBtn;

