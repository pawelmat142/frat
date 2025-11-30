import React from 'react';
import { useMenuContext } from '../providers/MenuProvider';
import Button from './controls/Button';
import { BtnModes } from '../interface/controls.interface';
import { useTranslation } from 'react-i18next';
import { useGlobalContext } from 'global/providers/GlobalProvider';

const DesktopMenu: React.FC = () => {

    const { items } = useMenuContext();
    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    
    if (!globalCtx.isDesktop) {
        return null;
    }

    return (
        <div className='flex gap-4'>
            {items.map((item) => (
                <Button key={item.label} className={item.active ? 'active' : ''} mode={BtnModes.SECONDARY_TXT} onClick={item.onClick} >
                    {t(item.label)}
                </Button>
            ))}
        </div>
    );
}

export default DesktopMenu;
