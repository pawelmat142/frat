import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const SWIPE_THRESHOLD = 60;
const ACTIONS_WIDTH = 120;

interface SwipeableRowProps {
    children: React.ReactNode;
    actions: React.ReactNode;
}

export interface SwipeableRowRef {
    close: () => void;
}

const SwipeableRow = forwardRef<SwipeableRowRef, SwipeableRowProps>(({ children, actions }, ref) => {
    const [offset, setOffset] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const startXRef = useRef<number | null>(null);
    const currentOffsetRef = useRef(0);

    useImperativeHandle(ref, () => ({
        close: () => {
            setOffset(0);
            setRevealed(false);
        },
    }));

    const handleTouchStart = (e: React.TouchEvent) => {
        startXRef.current = e.touches[0].clientX;
        currentOffsetRef.current = offset;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startXRef.current === null) return;
        const delta = startXRef.current - e.touches[0].clientX;
        const base = revealed ? ACTIONS_WIDTH : 0;
        const next = Math.max(0, Math.min(ACTIONS_WIDTH, base + delta));
        setOffset(next);
    };

    const handleTouchEnd = () => {
        const snap = offset > SWIPE_THRESHOLD ? ACTIONS_WIDTH : 0;
        setOffset(snap);
        setRevealed(snap > 0);
        startXRef.current = null;
    };

    // Mouse support for desktop testing
    const isDragging = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startXRef.current = e.clientX;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || startXRef.current === null) return;
        const delta = startXRef.current - e.clientX;
        const base = revealed ? ACTIONS_WIDTH : 0;
        const next = Math.max(0, Math.min(ACTIONS_WIDTH, base + delta));
        setOffset(next);
    };

    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const snap = offset > SWIPE_THRESHOLD ? ACTIONS_WIDTH : 0;
        setOffset(snap);
        setRevealed(snap > 0);
        startXRef.current = null;
    };

    return (
        <div
            className="relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Actions revealed behind the row */}
            <div
                className="absolute right-0 top-0 h-full flex items-center justify-end gap-1 px-2 secondary-bg"
                style={{ width: ACTIONS_WIDTH }}
            >
                {actions}
            </div>

            {/* Swipeable content */}
            <div
                className="relative bg-inherit select-none border-swiper-row"
                style={{
                    transform: `translateX(-${offset}px)`,
                    transition: startXRef.current === null ? 'transform 0.2s ease' : 'none',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
            >
                {children}
            </div>
        </div>
    );
});

export default SwipeableRow;
