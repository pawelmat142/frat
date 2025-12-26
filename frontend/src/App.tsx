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
import ProfilePage from 'user/views/AccountPage';
import ForgotPassword from 'auth/views/ForgotPassword';
import { ProtectedRoute } from 'auth/ProtectedRoute';
import { UserRoles } from '@shared/interfaces/UserI';
import EmployeeProfileFormView from 'employee/views/form/EmployeeProfileFormView';
import AdminFeedbacks from 'admin/views/feedback/AdminFeedbacks';
import EmployeeSearchView from 'employee/views/search/EmployeeSearchView';
import AdminEmployeeProfiles from 'admin/views/employee_profiles/AdminEmployeeProfiles';
import EmployeeProfileView from 'employee/views/profile/EmployeeProfileView';
import OfferFormView from 'offer/views/form/OfferFormView';
import MyOffersList from 'offer/views/MyOffersList';
import OfferView from 'offer/views/offer-view/OfferView';
import OfferSearchView from 'offer/views/search/OfferSearchView';
import AdminOffers from 'admin/views/offer/AdminOffers';

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

    const popupCtx = usePopup();
    const navigate = useNavigate()

    React.useEffect(() => {
        httpClient.setPopupHandler(popupCtx.popup);
    }, [popupCtx.popup]);
    React.useEffect(() => {
        httpClient.setNavigate(navigate);
    }, [navigate]);

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

                <Route path={Path.HOME} element={<PageWrapper direction={-1}><HomePage /></PageWrapper>} />

                <Route path={Path.ACCOUNT} element={<PageWrapper direction={1}><ProtectedRoute><ProfilePage /></ProtectedRoute></PageWrapper>} />

                {/* EMPLOYEE PROFILE */}
                <Route path={Path.EMPLOYEE_PROFILE} element={<PageWrapper direction={1}><EmployeeProfileView /></PageWrapper>} />
                <Route path={Path.EMPLOYEE_SEARCH} element={<PageWrapper direction={1}><EmployeeSearchView /></PageWrapper>} />
                <Route path={Path.EMPLOYEE_PROFILE_FORM} element={<PageWrapper direction={1}><ProtectedRoute><EmployeeProfileFormView /></ProtectedRoute></PageWrapper>} />

                {/* OFFERS */}
                <Route path={Path.OFFER_FORM} element={<PageWrapper direction={1}><ProtectedRoute><OfferFormView/></ProtectedRoute></PageWrapper>} />
                <Route path={Path.OFFER_FORM_EDIT} element={<PageWrapper direction={1}><ProtectedRoute><OfferFormView/></ProtectedRoute></PageWrapper>} />
                <Route path={Path.USER_OFFERS} element={<PageWrapper direction={1}><ProtectedRoute><MyOffersList/></ProtectedRoute></PageWrapper>} />
                {/* unprotected */}
                <Route path={Path.OFFER} element={<PageWrapper direction={1}><OfferView/></PageWrapper>} />
                <Route path={Path.OFFERS_SEARCH} element={<PageWrapper direction={1}><OfferSearchView/></PageWrapper>} />

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
                    <Route path={Path.ADMIN_FEEDBACKS} element={<AdminFeedbacks />} />
                    <Route path={Path.ADMIN_EMPLOYEE_PROFILES} element={<AdminEmployeeProfiles />} />
                    <Route path={Path.ADMIN_OFFERS} element={<AdminOffers />} />
                </Route>
            </Routes>
        </AnimatePresence>
    );
}

export default App;
