import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from "react";
import CloseBtn from "global/components/CloseBtn";

export interface OpenDrawerParams {
    title?: string;
    children: ReactNode;
    showClose?: boolean;
    onClean?: () => void;
}

interface DrawerContextType {
    open: (params: OpenDrawerParams) => void;
    close: () => void;
    params: OpenDrawerParams | null;
    isOpen: boolean;
    closing: boolean;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

const DrawerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [params, setParams] = useState<OpenDrawerParams | null>(null);
    const [animate, setAnimate] = useState(false);
    const [closing, setClosing] = useState(false);
    const closeTimeout = useRef<NodeJS.Timeout | null>(null);

    const open = useCallback((newParams: OpenDrawerParams) => {
        setParams(newParams);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setAnimate(false);
        setClosing(true);
        closeTimeout.current = setTimeout(() => {
            setIsOpen(false);
            setParams(null);
            setClosing(false);
        }, 300);
    }, []);

    // Slide-in animation on mount
    useEffect(() => {
        if (isOpen) {
            const id = requestAnimationFrame(() => setAnimate(true));
            return () => cancelAnimationFrame(id);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeout.current) clearTimeout(closeTimeout.current);
        };
    }, []);

    return (
        <DrawerContext.Provider value={{ open, close, params, isOpen, closing }}>
            {params && isOpen && (
                <div
                    className={`drawer-overlay fixed inset-0 z-50 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
                    role="dialog"
                    aria-modal="true"
                    onClick={close}
                >
                    <div
                        className={`drawer-panel absolute right-0 top-0 h-full shadow-xl ${animate ? 'translate-x-0' : 'translate-x-full'}`}
                        onClick={e => e.stopPropagation()}
                    >

                        <div className="flex justify-between items-center px-5 py-5">
                            {params.title && <div className="xl-font font-bold primary-color">{params.title}</div>}
                            {params.showClose && (
                                <CloseBtn onClick={close}></CloseBtn>
                            )}
                        </div>

                        <div className="drawer-content">{params.children}</div>
                    </div>
                </div>
            )}
            {children}
        </DrawerContext.Provider>
    );
};

export default DrawerProvider;

export const useDrawer = () => {
    const context = useContext(DrawerContext);
    if (context === undefined) {
        throw new Error('useDrawer must be used within a DrawerProvider');
    }
    return context;
};
