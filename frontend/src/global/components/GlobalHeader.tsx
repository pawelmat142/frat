import { useGlobalContext } from 'global/providers/GlobalProvider';
import { useTranslation } from 'react-i18next';
import DesktopMenu from './DesktopMenu';

const GlobalHeader: React.FC = () => {

    const { t } = useTranslation()
    const globalCtx = useGlobalContext();

    return (
        <header className='header'>
            <nav className='p-container h-full'>

                <div className="header-content">

                    <div className="header-content-left">
                        {globalCtx?.header?.leftBtn}

                        {globalCtx?.header?.title && (
                            <div className="header-title ml-2 btn-font pri-text">
                                {t(globalCtx?.header?.title)}
                            </div>
                        )}
                    </div>

                    <div className='flex items-center'>
                        {!!globalCtx.isDesktop && (<DesktopMenu />)}
                        {globalCtx?.header?.rightBtn}
                    </div>
                </div>

            </nav>
        </header>
    );
}

export default GlobalHeader;
