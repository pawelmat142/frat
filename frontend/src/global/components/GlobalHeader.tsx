import { useGlobalContext } from 'global/providers/GlobalProvider';
import { useTranslation } from 'react-i18next';
import DesktopMenu from './DesktopMenu';

const GlobalHeader: React.FC = () => {

    const { t } = useTranslation()
    const globalCtx = useGlobalContext();

    const stickyHeader = globalCtx?.state?.stickyHeader;
    return (
        <header className={`header relative`}>
            <nav className={` h-full ${stickyHeader ? 'sticky-header' : ''}`}>

                <div className="header-content p-container">

                    <div className="header-content-left">
                        {globalCtx?.state?.leftBtn}

                        {globalCtx?.state?.title && (
                            <div className="header-title ml-2 btn-font pri-text">
                                {t(globalCtx?.state?.title)}
                            </div>
                        )}
                    </div>

                    <div className='flex items-center'>
                        {!!globalCtx.isDesktop && (<DesktopMenu />)}
                        {globalCtx?.state?.rightBtn}
                    </div>
                </div>

            </nav>
        </header>
    );
}

export default GlobalHeader;
