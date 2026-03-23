import React, { useRef, useState } from "react";

interface LongTapHandlerProps {
    onLongTap: () => void;
    onTap?: () => void;
    holdMs?: number;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const RING_CIRCUMFERENCE = 163.4; // 2π * r=26

const LongTapHandler: React.FC<LongTapHandlerProps> = ({
    onLongTap,
    onTap,
    holdMs = 600,
    children,
    className,
    style,
}) => {
    const [holding, setHolding] = useState(false);
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startHold = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setHolding(true);
        holdTimer.current = setTimeout(() => {
            holdTimer.current = null;
            setHolding(false);
            onLongTap();
        }, holdMs);
    };

    // Released before threshold — treat as tap
    const endHold = () => {
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
            setHolding(false);
            onTap?.();
        }
    };

    const cancelHold = () => {
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }
        setHolding(false);
    };

    return (
        <>
            <style>{`@keyframes longTapRing { from { stroke-dashoffset: ${RING_CIRCUMFERENCE}; } to { stroke-dashoffset: 0; } }`}</style>
            <div
                className={className}
                style={{ touchAction: 'none', ...style }}
                onPointerDown={startHold}
                onPointerUp={endHold}
                onPointerLeave={cancelHold}
                onPointerCancel={cancelHold}
                onContextMenu={(e) => e.preventDefault()}
            >
                {children}
                {holding && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                        <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90">
                            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                            <circle
                                cx="30" cy="30" r="26"
                                fill="none" stroke="white" strokeWidth="3"
                                strokeDasharray={RING_CIRCUMFERENCE}
                                style={{ animation: `longTapRing ${holdMs}ms linear forwards` }}
                            />
                        </svg>
                    </div>
                )}
            </div>
        </>
    );
};

export default LongTapHandler;
