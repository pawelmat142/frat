import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from 'global/components/PageWrapper';
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
import WorkerSkillsFormView from 'employee/views/form/WorkerSkillsFormView';
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
import FriendsListView from 'friends/views/FriendsListView';
import SingleNotificationView from 'notification/views/SingleNotificationView';
import NotificationsView from 'notification/views/NotificationsView';
import TranslationItemForm from 'admin/views/translations/TranslationItemForm';
import SettingsView from 'user/views/SettingsView';
import DictionaryElementForm from 'admin/views/dictionaries/DictionaryElementForm';

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

                <Route path={Path.PROFILE} element={<PageWrapper isProtected><ProfileView /></PageWrapper>} />
                <Route path={Path.CHATS} element={<PageWrapper isProtected><ChatsView /></PageWrapper>} />
                <Route path={Path.CHAT_CONVERSATION} element={<PageWrapper isProtected><ChatConversationView /></PageWrapper>} />
                <Route path={Path.FRIENDS} element={<PageWrapper isProtected><FriendsListView /></PageWrapper>} />
                <Route path={Path.NOTIFICATIONS} element={<PageWrapper isProtected><NotificationsView /></PageWrapper>} />
                <Route path={Path.NOTIFICATION} element={<PageWrapper isProtected><SingleNotificationView /></PageWrapper>} />
                <Route path={Path.SETTINGS} element={<PageWrapper isProtected><SettingsView /></PageWrapper>} />

                {/* EMPLOYEE PROFILE */}
                <Route path={Path.WORKER} element={<PageWrapper><WorkerView /></PageWrapper>} />
                <Route path={Path.WORKERS_SEARCH} element={<PageWrapper><WorkersSearchView /></PageWrapper>} />
                <Route path={Path.WORKER_FORM} element={<PageWrapper isProtected><WorkerFormView /></PageWrapper>} />
                <Route path={Path.WORKER_SKILLS_FORM} element={<PageWrapper isProtected><WorkerSkillsFormView /></PageWrapper>} />

                {/* OFFERS */}
                <Route path={Path.OFFER_FORM} element={<PageWrapper isProtected><OfferFormView/></PageWrapper>} />
                <Route path={Path.OFFER_FORM_EDIT} element={<PageWrapper isProtected><OfferFormView/></PageWrapper>} />
                <Route path={Path.USER_OFFERS} element={<PageWrapper isProtected><UserOffersList/></PageWrapper>} />
                {/* unprotected */}
                <Route path={Path.OFFER} element={<PageWrapper><OfferView/></PageWrapper>} />
                <Route path={Path.OFFERS_SEARCH} element={<PageWrapper><OfferSearchView/></PageWrapper>} />

                <Route path={Path.SIGN_IN} element={<PageWrapper><SignInPage /></PageWrapper>} />
                <Route path={Path.SIGN_UP} element={<PageWrapper><SignUpPage /></PageWrapper>} />
                <Route path={Path.TELEGRAM_SIGN} element={<PageWrapper><TelegramSignPage /></PageWrapper>} />
                <Route path={Path.FORGOT_PASSWORD} element={<PageWrapper><ForgotPassword /></PageWrapper>} />

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
