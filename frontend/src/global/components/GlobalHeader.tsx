import { useGlobalContext } from 'global/providers/GlobalProvider';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import DesktopMenu from './DesktopMenu';

const GlobalHeader: React.FC = () => {

    const { t } = useTranslation()
    const globalCtx = useGlobalContext();

    const stickyHeader = globalCtx?.state?.stickyHeader;

    if (!globalCtx?.state) {
        return null;
    }

    return (
        <motion.header
            className={`header relative`}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <nav className={` h-full ${stickyHeader ? 'sticky-header' : ''}`}>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={globalCtx?.state?.title || 'empty'}
                        className="header-content p-container"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.15 }}
                    >

                        <div className="header-content-left">
                            {globalCtx?.state?.leftBtn}

                            {globalCtx?.state?.title && (
                                <div className="header-title ml-2 btn-font">
                                    {t(globalCtx.state.title)}
                                </div>
                            )}
                        </div>

                        <div className='flex items-center'>
                            {!!globalCtx.isDesktop && (<DesktopMenu />)}
                            {globalCtx?.state?.rightBtn}
                        </div>
                    </motion.div>
                </AnimatePresence>

            </nav>
        </motion.header>
    );
}

export default GlobalHeader;
