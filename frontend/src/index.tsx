import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.scss';
import { BrowserRouter } from 'react-router-dom';
import Header from './global/components/Header';
import Footer from './global/components/Footer';
import { ToastContainer } from 'react-toastify';
import { MenuProvider } from './global/navigation/MenuProvider';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MenuProvider>
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
      </MenuProvider>
    </BrowserRouter>
  </React.StrictMode>
);