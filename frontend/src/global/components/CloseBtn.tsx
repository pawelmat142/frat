
import { FaTimes } from 'react-icons/fa';
import IconButton from './controls/IconButon';

const CloseBtn: React.FC<{size?: number, onClick?: (e: React.MouseEvent) => void}> = ({ size = 24, onClick }) => {
    return (
        <div onClick={(e) => onClick?.(e)}>
            <IconButton icon={<FaTimes size={size} />} />
        </div>
    );
}

export default CloseBtn;  