import HeaderBackBtn from 'global/header-state/HeaderBackBtn';

interface HeaderProps {
    onBack?: () => void,
    title?: string
}

const Header: React.FC<HeaderProps> = ({ onBack, title }) => {

    return (
        <header className='header'>
            <nav className='p-container h-full'>

                <div className="header-content">

                    <div className="header-content-left">
                        <HeaderBackBtn  onBack={onBack}/>

                        {title && (
                            <div className="header-title ml-4 l-font primary-color">
                                {title}
                            </div>
                        )}
                    </div>

                </div>

            </nav>
        </header>
    );
}

export default Header;
