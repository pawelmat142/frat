import { AnimatePresence, motion } from "framer-motion";
import { Ico } from "global/icon.def";

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
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className={`fixed inset-0 z-50 flex flex-col ${className}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PseudoView;
