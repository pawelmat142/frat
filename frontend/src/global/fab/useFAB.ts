import { useEffect } from 'react';
import { useFloatingBtnContext, FABConfig } from 'global/fab/FloatingBtnProvider';

/**
 * Hook do deklaracji FAB w widokach.
 *
 * Użycie:
 * useFAB({
 *   type: 'chat',
 *   key: `chat:${userId}`,
 *   props: { userId },
 *   component: <ChatFAB userId={userId} />,
 * });
 *
 * lub bez FAB:
 * useFAB(null);
 */
export const useFAB = (config: FABConfig | null) => {
    const { setFAB, show: show } = useFloatingBtnContext();

    useEffect(() => {
        if (config) {
            setFAB(config);
            show();
        } else {
            setFAB(null);
        }
    }, [config?.key]);
};

export const FABkey = {
    chat: (uid: string) => `chat:${uid}`,
    workerSearch: 'workerSearch',
    offerSearch: 'offerSearch',
    trainingSearch: 'trainingSearch',
} as const; 

export const FABtype = {
    chat: 'chat',
    filters: 'filters',
} as const;
