import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Path } from './path';
import AdminPanelPage from './admin/views/AdminPanelPage';
import HomePage from './global/views/HomePage';


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
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path={Path.HOME} element={<PageWrapper direction={-1}><HomePage /></PageWrapper>} />
                <Route path={Path.ADMIN_PANEL} element={<PageWrapper direction={-1}><AdminPanelPage /></PageWrapper>} />
            </Routes>
        </AnimatePresence>
    );
}

export default App;
