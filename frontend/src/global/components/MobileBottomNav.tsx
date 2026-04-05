import { Z_INDEX } from 'global/def';
import { useMenuContext } from 'global/providers/MenuProvider';
import React from 'react';
import { motion } from 'framer-motion';

const MobileBottomNav: React.FC = () => {

    const menuCtx = useMenuContext();
    const iconSize = 22

    return (
        <motion.nav
            style={{ zIndex: Z_INDEX.BOTTOM_BAR }}
            className="mobile-bottom-nav bottom-bar-shadow disable-select"
            initial={{ y: '120%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '120%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div className="mobile-bottom-nav-container">

                {menuCtx.items.map((item, index) => (
                    <div key={index} className={`mobile-bottom-nav-item ripple${item.active ? ' active' : ''}`} onClick={item.onClick}>
                        {item.icon && <item.icon size={iconSize} />}
                        <div className="mobile-bottom-nav-label">{item.label}</div>
                        {item.badge && <div className="mobile-bottom-nav-badge">{item.badge}</div>}
                    </div>
                ))}
            </div>
        </motion.nav>
    );
};

export default MobileBottomNav;