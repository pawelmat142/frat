import { AppConfig } from "@shared/AppConfig";
import { UserRole } from "@shared/interfaces/UserI";
import { ProtectedRoute } from "auth/ProtectedRoute";
import { motion } from "framer-motion";

interface Props {
    children: React.ReactNode;
    direction?: number;
    className?: string;
    isProtected?: boolean;
    style?: React.CSSProperties;
    roles?: UserRole[];
}

const PageWrapper: React.FC<Props> = ({ children, direction = 1, className = "w-full flex flex-col items-center flex-1", isProtected, style, roles }) => {
    const motionDiv = <motion.div
        initial={{ x: 100 * direction, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100 * direction, opacity: 0 }}
        transition={{ duration: AppConfig.ROUTER_ANIMATION_DURATION / 1000, ease: 'easeInOut' }}
        className={className}
        style={style}
    >
        {children}
    </motion.div>

    if (isProtected || roles?.length) {
        return <ProtectedRoute roles={roles}>{motionDiv}</ProtectedRoute>
    }
    return motionDiv;
}

export default PageWrapper;
