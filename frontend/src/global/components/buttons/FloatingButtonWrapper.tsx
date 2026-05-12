import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFloatingBtnContext } from "global/providers/FloatingBtnProvider";

interface Props {}

const FloatingButtonWrapper: React.FC<Props> = () => {

    const { floatingButton, isVisible, floatingButtonKey } = useFloatingBtnContext();

    return (
        <AnimatePresence mode="wait">
            {floatingButton && isVisible && (
                <motion.div
                    key={floatingButtonKey}
                    className="floating-button-wrapper"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                >
                    {floatingButton}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FloatingButtonWrapper;