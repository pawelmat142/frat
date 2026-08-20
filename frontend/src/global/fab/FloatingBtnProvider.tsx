import { useLocation } from 'react-router-dom';
import { Path } from '../../path';
import React, { useEffect, useState, useCallback, useRef } from 'react';

export interface FABConfig {
    type: string;
    key: string;
    props?: Record<string, any>;
    component: React.ReactNode;
}

interface FloatingBtnContextType {
    current: FABConfig | null;
    isVisible: boolean;
    setFAB: (config: FABConfig | null) => void;
    hide: () => void;
    show: () => void;
}

const routesWithFAB = [
    Path.WORKER,
    Path.WORKERS_SEARCH,
    Path.OFFER,
    Path.OFFERS_SEARCH,
    Path.PROFILE,
].map(path => path.replace(/\/:\w+/g, '')); // Usuwamy dynamiczne segmenty z pathów, np. /offer/:id -> /offer

const FloatingBtnContext = React.createContext<FloatingBtnContextType | undefined>(undefined);

const FloatingBtnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [current, setCurrent] = useState<FABConfig | null>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const prevKeyRef = useRef<string | null>(null);
    const location = useLocation();
    
    // Gdy zmienia się config (key), pokazujemy/ukrywamy FAB
    useEffect(() => {
        if (current?.key !== prevKeyRef.current) {
            // Zmiana konfiguracji - animujemy exit/enter
            if (current) {
                // Nowy FAB - pokaż
                setIsVisible(true);
            } else {
                // Brak FAB - ukryj
                setIsVisible(false);
            }
            prevKeyRef.current = current?.key || null;
        }
    }, [current?.key]);

    useEffect(() => {
        const hasFAB = routesWithFAB.some(route => location.pathname.startsWith(route));
        if (!hasFAB) {
            hide();
        }
    }, [location.pathname]);

    const setFAB = useCallback((config: FABConfig | null) => {
        setCurrent(config);
    }, []);

    const hide = useCallback(() => {
        setIsVisible(false);
    }, []);

    const show = useCallback(() => {
        setIsVisible(true);
    }, []);

    return (
        <FloatingBtnContext.Provider value={{
            current,
            isVisible,
            setFAB,
            hide: hide,
            show: show,
        }}>
            {children}
        </FloatingBtnContext.Provider>
    );
};

export default FloatingBtnProvider;

export const useFloatingBtnContext = () => {
    const ctx = React.useContext(FloatingBtnContext);
    if (!ctx) {
        throw new Error('useFloatingBtnContext must be used within FloatingBtnProvider');
    }
    return ctx;
};
