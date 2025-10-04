import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Path } from './path';
import AdminPanelPage from './admin/views/AdminPanelPage';
import HomePage from './global/views/HomePage';
import AdminTranslations from 'admin/views/translations/AdminTranslations';
import AdminDictionaries from 'admin/views/dictionaries/AdminDictionaries';
import AddDictionaryView from 'admin/views/dictionaries/AddDictionaryView';
import DictionaryView from 'admin/views/dictionaries/DictionaryView';
import DictionaryGroupForm from 'admin/views/dictionaries/DictionaryGroupForm';
import { AdminPanelProvider } from 'admin/views/AdminPanelProvider';
import { useConfirm } from 'global/providers/ConfirmProvider';
import { httpClient } from 'global/services/http';

const PageWrapper: React.FC<{ children: React.ReactNode, direction: number }> = ({ children, direction }) => (
    <motion.div
        initial={{ x: 100 * direction, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100 * direction, opacity: 0 }}
        transition={{ duration: .2, ease: 'easeInOut' }}
        className="w-full h-full flex flex-col items-center flex-1"
    >
        {children}
    </motion.div>
);


const App: React.FC = () => {
    const location = useLocation();
    const direction = location.state?.direction === 'back' ? -1 : 1;
    
    const confirm = useConfirm();
    // Inject popup handler into httpClient
    React.useEffect(() => {
        httpClient.setPopupHandler(confirm);
    }, [confirm]);

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path={Path.HOME} element={<PageWrapper direction={-1}><HomePage /></PageWrapper>} />
                <Route path={Path.ADMIN_PANEL} element={ <AdminPanelProvider><AdminPanelPage /></AdminPanelProvider> }  >
                    <Route path={Path.ADMIN_DICTIONARY} element={<DictionaryView />} />
                    <Route path={Path.ADMIN_DICTIONARIES} element={<AdminDictionaries />} />
                    <Route path={Path.ADMIN_DICTIONARIES_ADD} element={<AddDictionaryView />} />
                    <Route path={Path.ADMIN_DICTIONARIES_EDIT} element={<AddDictionaryView />} />
                    <Route path={Path.ADMIN_DICTIONARIES_GROUP} element={<DictionaryGroupForm />} />
                    <Route path={Path.ADMIN_TRANSLATIONS} element={<AdminTranslations />} />
                </Route>
            </Routes>
        </AnimatePresence>
    );
}

export default App;
