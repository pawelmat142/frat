import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import { usePopup } from 'global/providers/PopupProvider';
import { httpClient } from 'global/services/http';
import ErrorPage from 'global/views/ErrorPage';
import SignUpPage from 'auth/views/SignUpPage';
import AdminUsers from 'admin/views/users/AdminUsers';
import SignInPage from 'auth/views/SignInPage';
import ProfilePage from 'user/views/ProfilePage';
import ForgotPassword from 'auth/views/ForgotPassword';
import { ProtectedRoute } from 'auth/ProtectedRoute';
import { UserRoles } from '@shared/interfaces/UserI';
import EmployeeProfileFormView from 'employee/views/EmployeeProfileFormView';

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

    const popup = usePopup();
    const navigate = useNavigate()
    
    React.useEffect(() => {
        httpClient.setPopupHandler(popup);
    }, [popup]);
    React.useEffect(() => {
        httpClient.setNavigate(navigate);
    }, [navigate]);

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                
                <Route path={Path.HOME} element={<PageWrapper direction={-1}><HomePage /></PageWrapper>} />

                <Route path={Path.PROFILE} element={<PageWrapper direction={1}><ProtectedRoute><ProfilePage /></ProtectedRoute></PageWrapper>} />
                <Route path={Path.EMPLOYEE_PROFILE_FORM} element={<PageWrapper direction={1}><ProtectedRoute><EmployeeProfileFormView /></ProtectedRoute></PageWrapper>} />

                <Route path={Path.SIGN_IN} element={<PageWrapper direction={1}><SignInPage /></PageWrapper>} />
                <Route path={Path.SIGN_UP} element={<PageWrapper direction={1}><SignUpPage /></PageWrapper>} />
                <Route path={Path.FORGOT_PASSWORD} element={<PageWrapper direction={1}><ForgotPassword /></PageWrapper>} />

                <Route path={Path.ERROR_PAGE} element={<ErrorPage />} />
               
                <Route path={Path.ADMIN_PANEL} element={
                    <AdminPanelProvider>
                        <ProtectedRoute roles={[UserRoles.ADMIN, UserRoles.SUPERADMIN]}>
                            <AdminPanelPage />
                        </ProtectedRoute>
                    </AdminPanelProvider>
                 }  >
                    <Route path={Path.ADMIN_DICTIONARY} element={<DictionaryView />} />
                    <Route path={Path.ADMIN_DICTIONARIES} element={<AdminDictionaries />} />
                    <Route path={Path.ADMIN_DICTIONARIES_ADD} element={<AddDictionaryView />} />
                    <Route path={Path.ADMIN_DICTIONARIES_EDIT} element={<AddDictionaryView />} />
                    <Route path={Path.ADMIN_DICTIONARIES_GROUP} element={<DictionaryGroupForm />} />
                    
                    <Route path={Path.ADMIN_TRANSLATIONS} element={<AdminTranslations />} />
                    <Route path={Path.ADMIN_USERS} element={<AdminUsers />} />
                </Route>
            </Routes>
        </AnimatePresence>
    );
}

export default App;
