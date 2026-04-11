import { AnimatePresence, motion } from "framer-motion";
import { AppConfig } from "@shared/AppConfig";
import { Z_INDEX } from "global/def";

interface Props {
    show: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * Fullscreen animated overlay — wraps AnimatePresence internally.
 * Use anywhere: gallery, datepicker, filters, etc.
 */
const PseudoView: React.FC<Props> = ({ show, children, className = "bg-black" }) => {
    const zIndex = Z_INDEX.PSEUDO_VIEW;
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ duration: AppConfig.ROUTER_ANIMATION_DURATION / 1000, ease: "easeInOut" }}
                    style={{ zIndex }}
                    className={`fixed inset-0 flex flex-col ${className}`}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PseudoView;
