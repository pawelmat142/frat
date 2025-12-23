import React, { useEffect, useRef } from 'react';

interface Props {
    emitEvent: () => void;
}
const InfiniteScrollEventEmitter: React.FC<Props> = ({ emitEvent }) => {
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry?.isIntersecting) {
                emitEvent();
            }
        }, {
            rootMargin: '0px 0px 200px 0px'
        });

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return <div ref={divRef}></div>;
}
export default InfiniteScrollEventEmitter;