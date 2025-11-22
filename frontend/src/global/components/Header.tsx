import { Path } from '../../path';
import DesktopMenu from './DesktopMenu';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import IconButton from './controls/IconButon';

interface HeaderProps {
    onBack?: () => void,
    title?: string
    hideMenu?: boolean
}

const Header: React.FC<HeaderProps> = ({ onBack, title, hideMenu }) => {

    const navigate = useNavigate()
    const location = useLocation()
    const isHome = location.pathname === Path.HOME

    return (
        <header className='header'>
            <nav className='p-container h-full'>

                <div className="header-content">

                    <div className="header-content-left">
                        {isHome ? (
                            <div className="logo">
                                <Logo size={42} showName={true} />
                            </div>
                        ) : (
                            <div className="logo cursor-pointer">
                                <IconButton
                                    icon={<FaArrowLeft size={32} className='primary-color' />}
                                    onClick={() => { onBack ? onBack() : navigate(-1) }}
                                />
                            </div>
                        )}

                        {title && (
                            <div className="header-title ml-4 l-font primary-color">
                                {title}
                            </div>
                        )}
                    </div>


                    {!hideMenu && <>
                        <div className="desktop-menu">
                            <DesktopMenu />
                        </div>

                        <div className="mobile-menu">
                            <MobileMenu />
                        </div>
                    </>}

                </div>

            </nav>
        </header>
    );
}

export default Header;
