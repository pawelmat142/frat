import { useGlobalContext } from 'global/providers/GlobalProvider';
import { useTranslation } from 'react-i18next';

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
                            <div className="header-title ml-2 l-font primary-color">
                                {t(globalCtx?.header?.title)}
                            </div>
                        )}
                    </div>

                    {globalCtx?.header?.rightBtn}
                </div>

            </nav>
        </header>
    );
}

export default GlobalHeader;
