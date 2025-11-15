import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';


const BottomSheet = () => {

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
        <div className={`bottom-sheet-backdrop${ctx.closing ? ' closing' : ''}`} onClick={handleBackdropClick}>
            <div 
                className={`bottom-sheet${ctx.isOpen ? ' open' : ''}${ctx.closing ? ' closing' : ''}`}
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
