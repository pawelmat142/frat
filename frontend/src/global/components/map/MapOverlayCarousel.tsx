import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import IconButton from 'global/components/controls/IconButon';

const SLIDE_VARIANTS = {
    enter: (d: number) => ({ x: 48 * d, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: -48 * d, opacity: 0 }),
};

interface MapOverlayCarouselProps {
    /** Zero-based index of the currently visible item. */
    selectedIndex: number;
    /** Total number of items. */
    total: number;
    /** Ref that holds the slide direction (+1 forward, -1 backward). */
    directionRef: React.MutableRefObject<number>;
    onPrev: () => void;
    onNext: () => void;
    /** The item card to display inside the animated slide. */
    children: React.ReactNode;
}

/**
 * Reusable animated overlay carousel placed on top of a Google Map.
 * Slides content left/right and shows a prev/next navigation bar.
 *
 * Domain-agnostic – pass any card as `children`.
 */
const MapOverlayCarousel: React.FC<MapOverlayCarouselProps> = ({
    selectedIndex,
    total,
    directionRef,
    onPrev,
    onNext,
    children,
}) => (
    <div className="map-overlay-panel">
        <AnimatePresence mode="wait" custom={directionRef.current}>
            <motion.div
                key={selectedIndex}
                custom={directionRef.current}
                variants={SLIDE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
        <div className="map-overlay-nav primary-bg">
            <IconButton icon={<FaChevronLeft />} onClick={onPrev} disabled={selectedIndex === 0} className="px-6" />
            <span className="s-font secondary-text">{selectedIndex + 1}/{total}</span>
            <IconButton icon={<FaChevronRight />} onClick={onNext} disabled={selectedIndex === total - 1} className="px-6" />
        </div>
    </div>
);

export default MapOverlayCarousel;
