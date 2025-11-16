import React, { createContext, useContext, useState, useRef } from 'react';
import { Position } from '@shared/interfaces/EmployeeProfileI';
import PositionSelectorPopup from 'global/components/selector/position/PositionSelectorPopup';

interface PositionSelectorContextType {
    openPositionSelector: (initialPosition?: Position | null, initializeByCountryCode?: string) => Promise<Position | null>;
}

interface PendingSelection {
    initialPosition?: Position | null;
    initializeByCountryCode?: string;
}

const PositionSelectorContext = createContext<PositionSelectorContextType | undefined>(undefined);

export const PositionSelectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
    const resolveRef = useRef<((value: Position | null) => void) | null>(null);

    const openPositionSelector = (
        initialPosition?: Position | null,
        initializeByCountryCode?: string
    ): Promise<Position | null> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setPendingSelection({
                initialPosition,
                initializeByCountryCode,
            });
            setIsOpen(true);
        });
    };

    const confirmSelection = (position: Position | null) => {
        if (resolveRef.current) {
            resolveRef.current(position);
            resolveRef.current = null;
        }
        setPendingSelection(null);
        setIsOpen(false);
    };

    const cancelSelection = () => {
        if (resolveRef.current) {
            resolveRef.current(null);
            resolveRef.current = null;
        }
        setPendingSelection(null);
        setIsOpen(false);
    };

    return (
        <PositionSelectorContext.Provider
            value={{
                openPositionSelector,
            }}
        >
            {children}
            {isOpen && pendingSelection && (
                <PositionSelectorPopup
                    initialPosition={pendingSelection.initialPosition}
                    initializeByCountryCode={pendingSelection.initializeByCountryCode}
                    onConfirm={confirmSelection}
                    onCancel={cancelSelection}
                />
            )}
        </PositionSelectorContext.Provider>
    );
};

export const usePositionSelector = () => {
    const context = useContext(PositionSelectorContext);
    if (context === undefined) {
        throw new Error('usePositionSelector must be used within a PositionSelectorProvider');
    }
    return context;
};
