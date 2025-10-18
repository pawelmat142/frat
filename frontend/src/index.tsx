import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './global/i18n';
import './styles/index.scss';
import { BrowserRouter } from 'react-router-dom';
import Header from './global/components/Header';
import Footer from './global/components/Footer';
import { ToastContainer } from 'react-toastify';
import { MenuProvider } from './global/providers/MenuProvider';
import { ThemeProvider } from './global/providers/ThemeProvider';
import { PopupProvider } from 'global/providers/PopupProvider';
import { AuthProvider } from 'auth/AuthProvider';
import { UserProvider } from 'user/UserProvider';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
    <PopupProvider>
      <AuthProvider>
        <UserProvider>
          <MenuProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden">
                  <App />
                </main>
                <Footer />
                {/* TODO <CookieBanner /> */}
              </div>
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
            </ThemeProvider>
          </MenuProvider>
        </UserProvider>
      </AuthProvider>

    </PopupProvider>

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

    </BrowserRouter>
  </React.StrictMode>
);