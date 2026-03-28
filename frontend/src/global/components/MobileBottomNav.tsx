import { useMenuContext } from 'global/providers/MenuProvider';
import React from 'react';

const MobileBottomNav: React.FC = () => {

    const menuCtx = useMenuContext();
    const iconSize = 22

    return (
        <nav className="mobile-bottom-nav bottom-bar-shadow disable-select">
            <div className="mobile-bottom-nav-container">

                {menuCtx.items.map((item, index) => (
                    <div key={index} className={`mobile-bottom-nav-item ripple${item.active ? ' active' : ''}`} onClick={item.onClick}>
                        {item.icon && <item.icon size={iconSize} />}
                        <div className="mobile-bottom-nav-label">{item.label}</div>
                        {item.badge && <div className="mobile-bottom-nav-badge">{item.badge}</div>}
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default MobileBottomNav;