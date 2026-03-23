import { AppConfig } from "@shared/AppConfig";
import { motion } from "framer-motion";

interface Props {
    children: React.ReactNode;
    direction?: number;
    className?: string;
}

const PageWrapper: React.FC<Props> = ({ children, direction = 1, className = "w-full flex flex-col items-center flex-1" }) => (
    <motion.div
        initial={{ x: 100 * direction, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100 * direction, opacity: 0 }}
        transition={{ duration: AppConfig.ROUTER_ANIMATION_DURATION / 1000, ease: 'easeInOut' }}
        className={className}
    >
        {children}
    </motion.div>
);

export default PageWrapper;
