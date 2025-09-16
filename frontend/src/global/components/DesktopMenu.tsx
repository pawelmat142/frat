import React from 'react';
import { useMenuContext } from '../navigation/MenuProvider';
import Buton from './controls/Buton';
import { BtnModes } from '../interface/controls.interface';

const DesktopMenu: React.FC = () => {

    const { menuItems } = useMenuContext();

    return (
        <div className='flex gap-4'>
            {menuItems.filter(item => !item.skipHeader).map((item) => (
                <Buton to={item.to} className={item.active ? 'active' : ''} mode={BtnModes.SECONDARY_TXT}>{item.label}</Buton>
            ))}
        </div>
    );
}

export default DesktopMenu;
