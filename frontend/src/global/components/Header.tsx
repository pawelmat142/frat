import ThemeSwitch from './controls/ThemeSwitch';
import DesktopMenu from './DesktopMenu';
import Logo from './Logo';
import MobileMenu from './MobileMenu';

const Header: React.FC = () => {

    return (
        <header className='header'>
            <nav>

                <div className="logo">
                    <Logo size={42} showName={true}/>
                </div>

                <div className="desktop-menu">
                    <DesktopMenu />
                </div>
                
                <div className="mobile-menu">
                    <MobileMenu />
                </div>

                <div className="desktop-flex">
                    <ThemeSwitch />
                    {/* TODO logged user */}
                </div>

            </nav>
        </header>
    );
}

export default Header;
