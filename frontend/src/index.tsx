import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './global/i18n';
import './styles/index.scss';
import { BrowserRouter } from 'react-router-dom';
import LayoutFooterSwitch from 'global/components/LayoutFooterSwitch';
import CookieBanner from './global/components/CookieBanner';
import { ToastContainer } from 'react-toastify';
import { MenuProvider } from './global/providers/MenuProvider';
import { ThemeProvider } from './global/providers/ThemeProvider';
import { PopupProvider } from 'global/providers/PopupProvider';
import { CookieProvider } from 'global/providers/CookieProvider';
import { AuthProvider } from 'auth/AuthProvider';
import { UserProvider } from 'user/UserProvider';
import { BottomSheetProvider } from 'global/providers/BottomSheetProvider';
import DrawerProvider from 'global/providers/DrawerProvider';
import WorkersSearchProvider from 'employee/views/search/WorkersSearchProvider';
import { GlobalProvider } from 'global/providers/GlobalProvider';
import OfferSearchProvider from 'offer/views/search/OfferSearchProvider';
import { ChatsProvider } from 'chat/ChatsProvider';
import { NotificationsProvider } from 'notification/NotificationsProvider';
import { FriendsProvider } from 'friends/FriendsProvider';
import { UsersStorageProvider } from 'global/providers/UsersStorageProvider';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import FloatingButtonWrapper from 'global/components/buttons/FloatingButtonWrapper';
import { motion } from 'framer-motion';
import FloatingBtnProvider from 'global/providers/FloatingBtnProvider';

const AppShell: React.FC = () => {
  const { isFooterHidden } = useGlobalContext();
  return (
    <div className="app-shell">
      <motion.main layout transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className={`app-main${isFooterHidden ? ' hide-footer' : ''}`}>
        <App />
      </motion.main>
      <LayoutFooterSwitch />
      <FloatingButtonWrapper />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GlobalProvider>
        <FloatingBtnProvider>
          <PopupProvider>
            <BottomSheetProvider>
              <DrawerProvider>
                <ThemeProvider>
                  <UsersStorageProvider>
                    <CookieProvider>
                      <AuthProvider>
                        <UserProvider>
                          <FriendsProvider>
                            <ChatsProvider>
                              <NotificationsProvider>
                                <OfferSearchProvider>
                                  <WorkersSearchProvider>
                                    <MenuProvider>

                                      <AppShell />

                                      <CookieBanner />
                                      <ToastContainer
                                        position="top-right"
                                        autoClose={3000}
                                        hideProgressBar={false}
                                        newestOnTop={false}
                                        closeOnClick
                                        rtl={false}
                                        pauseOnFocusLoss
                                        draggable
                                        pauseOnHover
                                      />
                                    </MenuProvider>
                                  </WorkersSearchProvider>
                                </OfferSearchProvider>
                              </NotificationsProvider>
                            </ChatsProvider>
                          </FriendsProvider>
                        </UserProvider>
                      </AuthProvider>
                    </CookieProvider>
                  </UsersStorageProvider>
                </ThemeProvider>
              </DrawerProvider>
            </BottomSheetProvider>
          </PopupProvider>
        </FloatingBtnProvider>
      </GlobalProvider>
    </BrowserRouter>
  </React.StrictMode>
);