import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFloatingBtnContext } from "global/fab/FloatingBtnProvider";

const FloatingButtonWrapper: React.FC = () => {
    const { current, isVisible } = useFloatingBtnContext();

    return (
        <AnimatePresence mode="wait">
            {current && (
                <motion.div
                    key={current.key}
                    className="floating-button-wrapper"
                    initial={{ opacity: 0, y: 100 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {current.component}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FloatingButtonWrapper;