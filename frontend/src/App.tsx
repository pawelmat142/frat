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
import ProfileView from 'user/views/ProfileView';
import ForgotPassword from 'auth/views/ForgotPassword';
import { ProtectedRoute } from 'auth/ProtectedRoute';
import { UserRoles } from '@shared/interfaces/UserI';
import WorkerFormView from 'employee/views/form/WorkerFormView';
import AdminFeedbacks from 'admin/views/feedback/AdminFeedbacks';
import WorkersSearchView from 'employee/views/search/WorkersSearchView';
import AdminEmployeeProfiles from 'admin/views/employee_profiles/AdminEmployeeProfiles';
import WorkerView from 'employee/views/profile/WorkerView';
import OfferFormView from 'offer/views/form/OfferFormView';
import UserOffersList from 'offer/views/UserOffersList';
import OfferView from 'offer/views/offer-view/OfferView';
import { useRippleEffect } from 'global/hooks/useRippleEffect';
import OfferSearchView from 'offer/views/search/OfferSearchView';
import AdminOffers from 'admin/views/offer/AdminOffers';
import TelegramSignPage from 'auth/views/TelegramSignPage';
import ChatsView from 'chat/views/ChatsView';
import ChatConversationView from 'chat/views/ChatConversationView';
import WorkersSearchFiltersView from 'employee/views/search/WorkersSearchFiltersView';
import FriendsListView from 'friends/views/FriendsListView';
import SingleNotificationView from 'notification/views/SingleNotificationView';
import NotificationsView from 'notification/views/NotificationsView';
import TranslationItemForm from 'admin/views/translations/TranslationItemForm';
import SettingsView from 'user/views/SettingsView';
import OfferSearchFiltersView from 'offer/views/search/OfferSearchFiltersView';
import DictionaryElementForm from 'admin/views/dictionaries/DictionaryElementForm';

const PageWrapper: React.FC<{ children: React.ReactNode, direction: number }> = ({ children, direction }) => (
    <motion.div
        initial={{ x: 100 * direction, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100 * direction, opacity: 0 }}
        transition={{ duration: .15, ease: 'easeInOut' }}
        className="w-full flex flex-col items-center flex-1"
    >
        {children}
    </motion.div>
);


const App: React.FC = () => {
    const location = useLocation();
    useRippleEffect();
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

                <Route path={Path.PROFILE} element={<PageWrapper direction={1}><ProtectedRoute><ProfileView /></ProtectedRoute></PageWrapper>} />
                <Route path={Path.CHATS} element={<PageWrapper direction={1}><ProtectedRoute><ChatsView /></ProtectedRoute></PageWrapper>} />
                <Route path={Path.CHAT_CONVERSATION} element={<PageWrapper direction={1}><ProtectedRoute><ChatConversationView /></ProtectedRoute></PageWrapper>} />
                <Route path={Path.FRIENDS} element={<PageWrapper direction={1}><ProtectedRoute><FriendsListView /></ProtectedRoute></PageWrapper>} />
                <Route path={Path.NOTIFICATIONS} element={<PageWrapper direction={1}><ProtectedRoute><NotificationsView /></ProtectedRoute></PageWrapper>} />
                <Route path={Path.NOTIFICATION} element={<PageWrapper direction={1}><ProtectedRoute><SingleNotificationView /></ProtectedRoute></PageWrapper>} />
                <Route path={Path.SETTINGS} element={<PageWrapper direction={1}><ProtectedRoute><SettingsView /></ProtectedRoute></PageWrapper>} />

                {/* EMPLOYEE PROFILE */}
                <Route path={Path.WORKER} element={<PageWrapper direction={1}><WorkerView /></PageWrapper>} />
                <Route path={Path.WORKERS_SEARCH} element={<PageWrapper direction={1}><WorkersSearchView /></PageWrapper>} />
                <Route path={Path.WORKERS_FILTERS_SEARCH} element={<PageWrapper direction={1}><WorkersSearchFiltersView /></PageWrapper>} />
                <Route path={Path.WORKER_FORM} element={<PageWrapper direction={1}><ProtectedRoute><WorkerFormView /></ProtectedRoute></PageWrapper>} />

                {/* OFFERS */}
                <Route path={Path.OFFER_FORM} element={<PageWrapper direction={1}><ProtectedRoute><OfferFormView/></ProtectedRoute></PageWrapper>} />
                <Route path={Path.OFFER_FORM_EDIT} element={<PageWrapper direction={1}><ProtectedRoute><OfferFormView/></ProtectedRoute></PageWrapper>} />
                <Route path={Path.USER_OFFERS} element={<PageWrapper direction={1}><ProtectedRoute><UserOffersList/></ProtectedRoute></PageWrapper>} />
                <Route path={Path.OFFERS_FILTERS_SEARCH} element={<PageWrapper direction={1}><ProtectedRoute><OfferSearchFiltersView/></ProtectedRoute></PageWrapper>} />
                {/* unprotected */}
                <Route path={Path.OFFER} element={<PageWrapper direction={1}><OfferView/></PageWrapper>} />
                <Route path={Path.OFFERS_SEARCH} element={<PageWrapper direction={1}><OfferSearchView/></PageWrapper>} />

                <Route path={Path.SIGN_IN} element={<PageWrapper direction={1}><SignInPage /></PageWrapper>} />
                <Route path={Path.SIGN_UP} element={<PageWrapper direction={1}><SignUpPage /></PageWrapper>} />
                <Route path={Path.TELEGRAM_SIGN} element={<PageWrapper direction={1}><TelegramSignPage /></PageWrapper>} />
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
                    <Route path={Path.ADMIN_DICTIONARIES_EDIT_ELEMENT} element={<DictionaryElementForm />} />
                    <Route path={Path.ADMIN_DICTIONARIES_ADD_ELEMENT} element={<DictionaryElementForm />} />

                    <Route path={Path.ADMIN_TRANSLATIONS} element={<AdminTranslations />} />
                    <Route path={Path.ADMIN_TRANSLATION_ITEM} element={<TranslationItemForm />} />
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
