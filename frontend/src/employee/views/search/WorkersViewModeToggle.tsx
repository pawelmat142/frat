import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import IconButton from "global/components/controls/IconButon";
import { Ico } from "global/icon.def";
import { BtnModes } from "global/interface/controls.interface";

type ViewMode = 'list' | 'map';

interface Props {
    viewMode: ViewMode;
    onClick: () => void;
}

const WorkersViewModeToggle: React.FC<Props> = ({ viewMode, onClick }) => (
    <IconButton
        mode={BtnModes.PRIMARY_TXT}
        icon={
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={viewMode}
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    style={{ display: 'flex' }}
                >
                    {viewMode === 'list' ? <Ico.MAP size={20} /> : <Ico.LIST size={20} />}
                </motion.span>
            </AnimatePresence>
        }
        onClick={onClick}
    />
);

export default WorkersViewModeToggle;
