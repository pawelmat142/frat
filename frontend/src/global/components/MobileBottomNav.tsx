import { useMenuContext } from 'global/providers/MenuProvider';
import React from 'react';

const MobileBottomNav: React.FC = () => {

    const menuCtx = useMenuContext();

    return (
        <nav className="mobile-bottom-nav">
            <div className="mobile-bottom-nav-container">

                {menuCtx.items.map((item, index) => (
                    <div key={index} className={`mobile-bottom-nav-item ripple${item.active ? ' active' : ''}`} onClick={item.onClick}>
                        {item.icon }
                        <div className="mobile-bottom-nav-label">{item.label}</div>
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default MobileBottomNav;