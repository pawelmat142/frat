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
import { FullScreenDialogProvider } from 'global/providers/FullScreenDialogProvider';
import { GlobalProvider } from 'global/providers/GlobalProvider';
import GlobalHeader from 'global/components/GlobalHeader';
import OfferSearchProvider from 'offer/views/search/OfferSearchProvider';
import NotificationsGlobalBar from 'notification/components/NotificationsGlobalBar';
import { ChatsProvider } from 'chat/ChatsProvider';
import { NotificationsProvider } from 'notification/NotificationsProvider';
import { FriendsProvider } from 'friends/FriendsProvider';
import { OffersProvider } from 'offer/OffersProvider';
import { WorkerProvider } from 'employee/WorkerProvider';
import { UsersStorageProvider } from 'global/providers/UsersStorageProvider';
import { useGlobalContext } from 'global/providers/GlobalProvider';

const AppShell: React.FC = () => {
  const { state } = useGlobalContext();
  return (
    <div className="app-shell">
      <GlobalHeader />
      <NotificationsGlobalBar />
      <main className={`app-main${state.hideFooter ? ' hide-footer' : ''}`}>
        <App />
      </main>
      <LayoutFooterSwitch />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GlobalProvider>
        <FullScreenDialogProvider>
          <PopupProvider>
            <BottomSheetProvider>
              <DrawerProvider>
                <ThemeProvider>
                  <UsersStorageProvider>
                    <CookieProvider>
                      <AuthProvider>
                        <UserProvider>
                          <FriendsProvider>
                            <OffersProvider>
                              <WorkerProvider>
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
                                            theme="light"
                                          />
                                        </MenuProvider>
                                      </WorkersSearchProvider>
                                    </OfferSearchProvider>
                                  </NotificationsProvider>
                                </ChatsProvider>
                              </WorkerProvider>
                            </OffersProvider>
                          </FriendsProvider>
                        </UserProvider>
                      </AuthProvider>
                    </CookieProvider>
                  </UsersStorageProvider>
                </ThemeProvider>
              </DrawerProvider>
            </BottomSheetProvider>
          </PopupProvider>
        </FullScreenDialogProvider>
      </GlobalProvider>
    </BrowserRouter>
  </React.StrictMode>
);