import React from 'react';
import { useMenuContext } from '../navigation/MenuProvider';
import { Link } from 'react-router-dom';

const DesktopMenu: React.FC = () => {

    const { menuItems } = useMenuContext();

    return (
        <div className='flex gap-4'>
            {menuItems.filter(item => !item.skipHeader).map((item) => (
                item.to ?
                <Link key={item.label} to={item.to} className={`ripple txt-link ${item.active ? 'active' : ''}`}>
                    {item.label}
                </Link>
                :
                <button key={item.label} className={`ripple ${item.active ? 'active' : ''}`}>
                    {item.label}
                </button>
            ))}
        </div>
    );
}

export default DesktopMenu;
