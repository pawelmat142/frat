import React, { useState } from 'react';

interface FloatingBtnContextType {
    floatingButton: React.ReactNode;
    isVisible: boolean;
    setup: (button: React.ReactNode, id: string) => void;
    hide: (param?: { remove: boolean }) => Promise<void>;
    show(): Promise<void>;
}

const FloatingBtnContext = React.createContext<FloatingBtnContextType | undefined>(undefined);

const FloatingBtnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [floatingButton, setFloatingButton] = useState<React.ReactNode>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const [currenctFabId, setCurrentFabId] = useState<string | null>(null);


    const hide: (param?: { remove: boolean }) => Promise<void> = async (params) => {
        const { remove } = params || {} as { remove?: boolean };

        setIsVisible(false);
        
        if (remove) {
            setCurrentFabId(null);
            setTimeout(() => {
                setFloatingButton(null);
            }, 300); // Match this duration with the exit animation duration
        }
    }

    return (<FloatingBtnContext.Provider value={{
        floatingButton,
        isVisible,
        setup: (button: React.ReactNode, id: string) => {
            if (id === currenctFabId) return;
            setFloatingButton(button);
            setCurrentFabId(id);
        },
        show: async () => {
            setIsVisible(true);
        },
        hide
    }}>
        {children}
    </FloatingBtnContext.Provider>)
};

export default FloatingBtnProvider;

export const useFloatingBtnContext = () => {
    const ctx = React.useContext(FloatingBtnContext);
    if (!ctx) {
        throw new Error("useFloatingBtnContext must be used within FloatingBtnProvider");
    }
    return ctx;
};
