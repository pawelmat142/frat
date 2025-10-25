import React, { useEffect, useState, useCallback } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from './controls/IconButon';
import Button from './controls/Button';
import { BtnModes } from '../interface/controls.interface';
import { useMenuContext } from '../providers/MenuProvider';
import { useTranslation } from 'react-i18next';

const MobileMenu: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { menuItems } = useMenuContext();
    const { t } = useTranslation();

    const close = useCallback(() => {
        // start slide-out animation
        setAnimate(false);
        // unmount after animation
        setTimeout(() => setOpen(false), 300);
    }, []);
    const toggle = useCallback(() => setOpen(v => !v), []);

    // Animate slide-in on mount of the drawer
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        if (open) {
            // next frame -> enable transition to slide in
            const id = requestAnimationFrame(() => setAnimate(true));
            return () => cancelAnimationFrame(id);
        } else {
            setAnimate(false);
        }
    }, [open]);

    // Close on ESC
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, close]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [open]);

    return (
        <>
            {/* Trigger button (visible on mobile via header styles) */}
            <IconButton
                aria-label="Open mobile menu"
                className="mobile-menu-btn"
                icon={<MenuIcon fontSize="large" />}
                onClick={toggle}
            />

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                >
                    <div
                        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
                        onClick={close}
                    />

                    {/* Drawer */}
                    <div className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] primary-bg primary-text z-50 shadow-xl border-l border border-color transform transition-transform duration-300 ${animate ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="h2">{t('header.menu') || 'Menu'}</span>
                            <IconButton
                                aria-label="Close mobile menu"
                                mode={BtnModes.PRIMARY}
                                icon={<CloseIcon fontSize="large" />}
                                onClick={close}
                            />
                        </div>

                        <nav className="flex flex-col p-2 gap-3 mt-5">
                            {menuItems
                                .filter(item => !item.skipMobileMenu)
                                .map((item) => (
                                    <Button
                                        key={item.to || item.label}
                                        to={item.to}
                                        mode={BtnModes.SECONDARY_TXT}
                                        fullWidth
                                        className={`justify-start px-3 py-3 border-b border ${item.active ? 'active' : ''}`}
                                        onClick={close}
                                    >
                                        {t(item.label)}
                                    </Button>
                                ))}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileMenu;
