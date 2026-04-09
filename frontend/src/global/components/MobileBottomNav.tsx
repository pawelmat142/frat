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
            initial={{ y: '140%', opacity: 0 }}
            animate={{
                y: ['140%', '-4%', '0%'],
                opacity: [0, 1, 1],
                transition: {
                    duration: 0.45,
                    ease: [0.22, 0.7, 0.3, 0.94],
                    times: [0, 0.7, 1],
                }
            }}
            exit={{
                y: ['0%', '6%', '140%'],
                opacity: [1, 0.9, 0],
                transition: {
                    duration: 0.38,
                    ease: [0.55, 0.06, 0.68, 0.19],
                    times: [0, 0.25, 1],
                }
            }}
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