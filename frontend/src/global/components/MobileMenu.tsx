import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';

const MobileMenu: React.FC = () => {
    return (
        <button aria-label="Open mobile menu" type="button" className=' ripple'>
            <MenuIcon fontSize="large" />
        </button>
    );
}

export default MobileMenu;
