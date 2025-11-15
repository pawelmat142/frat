import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';


const BottomSheet = () => {

    const { t } = useTranslation();
    const ctx = useBottomSheet();
    
    useEffect(() => {
        if (ctx.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [ctx.isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            ctx.close();
        }
    };

    if (!ctx.isOpen) return null;

    return (
        <div className="bottom-sheet-backdrop" onClick={handleBackdropClick}>
            <div 
                className={`bottom-sheet ${ctx.isOpen ? 'bottom-sheet-open' : ''}`}
            >
                <div className="bottom-sheet-header">
                    <div className="bottom-sheet-drag-handle" />
                    {ctx.params?.title && <h3 className="bottom-sheet-title">{ctx.params.title}</h3>}
                    <button 
                        className="bottom-sheet-close-btn"
                        onClick={ctx.close}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>

                {ctx.params?.children}

            </div>
        </div>
    );
};

export default BottomSheet;
