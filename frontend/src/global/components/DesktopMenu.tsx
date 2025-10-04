import React from 'react';
import { useMenuContext } from '../providers/MenuProvider';
import Buton from './controls/Buton';
import { BtnModes } from '../interface/controls.interface';
import { useTranslation } from 'react-i18next';

const DesktopMenu: React.FC = () => {

    const { menuItems } = useMenuContext();

    const { t } = useTranslation();

    return (
        <div className='flex gap-4'>
            {menuItems.filter(item => !item.skipHeader).map((item) => (
                <Buton key={item.to || item.label} to={item.to} className={item.active ? 'active' : ''} mode={BtnModes.SECONDARY_TXT}>
                    {t(item.label)}
                </Buton>
            ))}
        </div>
    );
}

export default DesktopMenu;
