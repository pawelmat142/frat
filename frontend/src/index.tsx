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
import EmployeeSearchProvider from 'employee/views/search/EmployeeSearchProvider';
import { FullScreenDialogProvider } from 'global/providers/FullScreenDialogProvider';
import { GlobalProvider } from 'global/providers/GlobalProvider';
import GlobalHeader from 'global/components/GlobalHeader';
import OfferSearchProvider from 'offer/views/search/OfferSearchProvider';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalProvider>
        <FullScreenDialogProvider>
          <PopupProvider>
            <BottomSheetProvider>
              <DrawerProvider>
                <ThemeProvider>
                  <CookieProvider>
                    <AuthProvider>
                      <UserProvider>
                        <OfferSearchProvider>
                          <EmployeeSearchProvider>
                            <MenuProvider>
                              <div className="min-h-screen flex flex-col">
                                <GlobalHeader />
                                <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden">
                                  <App />
                                </main>
                                <LayoutFooterSwitch />
                              </div>
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
                          </EmployeeSearchProvider>
                        </OfferSearchProvider>
                      </UserProvider>
                    </AuthProvider>
                  </CookieProvider>
                </ThemeProvider>
              </DrawerProvider>
            </BottomSheetProvider>
          </PopupProvider>
        </FullScreenDialogProvider>
      </GlobalProvider>
    </BrowserRouter>
  </React.StrictMode>
);