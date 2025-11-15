import { Path } from '../../path';
import DesktopMenu from './DesktopMenu';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import IconButton from './controls/IconButon';

const Header: React.FC = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const isHome = location.pathname === Path.HOME

    return (
        <header className='header'>
            <nav className='p-container h-full'>

                <div className="header-content">
                    {isHome ? (
                        <div className="logo">
                            <Logo size={42} showName={true}/>
                        </div>
                    ) : (
                        <div className="logo cursor-pointer">
                            <IconButton 
                                icon={<FaArrowLeft size={32} className='primary-color'/>}
                                onClick={() => {navigate(-1)}}
                            />
                        </div>
                    )}

                    <div className="desktop-menu">
                        <DesktopMenu />
                    </div>
                    
                    <div className="mobile-menu">
                        <MobileMenu />
                    </div>
                </div>

            </nav>
        </header>
    );
}

export default Header;
