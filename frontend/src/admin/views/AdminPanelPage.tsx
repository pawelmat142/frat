import MobileMock from "../../global/components/MobileMock";
import { useIsMobile } from "../../global/hooks/isMobile";
import AdminPanelSidebar from "./AdminPanelSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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

const AdminPanelPage: React.FC = () => {
    const mobile = useIsMobile();
    const location = useLocation();
    const direction = location.state?.direction === 'back' ? -1 : 1;

    if (mobile) {
        return <MobileMock />;
    }

    return (
        <div className="admin-panel">
            <AdminPanelSidebar />
            <div className="admin-panel-content">
                <AnimatePresence mode="wait">
                    <PageWrapper direction={direction} key={location.pathname}>
                        <Outlet />
                    </PageWrapper>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPanelPage;
