import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuContext } from 'global/providers/MenuProvider';
import { Path } from '../../path';
import Logo from './Logo';

const DesktopHeader: React.FC = () => {
    const { items } = useMenuContext();
    const navigate = useNavigate();

    return (
        <header className="desktop-header" data-testid="desktop-header">
            <nav className="desktop-header-content p-container" aria-label="Primary navigation">
                <button className="desktop-header-brand" type="button" onClick={() => navigate(Path.HOME)} aria-label="FRAT home">
                    <Logo size={32} className="desktop-header-logo" />
                    <span className="desktop-header-title">FRAT</span>
                </button>

                <div className="desktop-header-navigation">
                    {items.map((item) => (
                        <button
                            key={item.id || item.label}
                            className={`desktop-header-nav-item ripple${item.active ? ' active' : ''}`}
                            type="button"
                            onClick={item.onClick}
                        >
                            {item.icon && <item.icon size={20} aria-hidden="true" />}
                            <span>{item.label}</span>
                            {item.badge && <span className="desktop-header-badge">{item.badge}</span>}
                        </button>
                    ))}
                </div>

                <div className="desktop-header-actions" aria-hidden="true" />
            </nav>
        </header>
    );
};

export default DesktopHeader;