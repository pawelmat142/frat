
import { FaTimes } from 'react-icons/fa';
import IconButton from './controls/IconButon';
import { BtnModes } from 'global/interface/controls.interface';
import { Ico } from 'global/icon.def';

const CloseBtn: React.FC<{size?: number, onClick?: (e: React.MouseEvent) => void}> = ({ size = 24, onClick }) => {
    return (
        <div onClick={(e) => onClick?.(e)}>
            <IconButton mode={BtnModes.SECONDARY_TXT} icon={<Ico.CANCEL size={size} className='p-0' />} />
        </div>
    );
}

export default CloseBtn;  