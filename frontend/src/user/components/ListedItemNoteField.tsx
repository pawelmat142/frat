import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserListedItem } from '@shared/interfaces/UserListedItem';
import FloatingTextarea from 'global/components/controls/FloatingTextarea';
import Button from 'global/components/controls/Button';
import { BtnModes, BtnSizes } from 'global/interface/controls.interface';

interface ListedItemNoteFieldProps {
    item: UserListedItem;
    open: boolean;
    onClose: () => void;
    // TODO: replace with real API call
    onSave?: (item: UserListedItem, note: string) => Promise<void>;
}

const ListedItemNoteField: React.FC<ListedItemNoteFieldProps> = ({ item, open, onClose, onSave }) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim()) return;
        setLoading(true);
        try {


            
            // TODO: wire up real API
            await onSave?.(item, note.trim());
            setNote('');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setNote('');
        onClose();
    };

    // TODO translacje
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="note-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                >
                    <form
                        className="flex flex-col gap-3 px-3 py-3 border-swiper-row p-5"
                        onSubmit={handleSubmit}
                    >
                        <FloatingTextarea
                            name="note"
                            label="Notatka"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            fullWidth
                            initialRows={2}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                mode={BtnModes.SECONDARY_TXT}
                                size={BtnSizes.SMALL}
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Anuluj
                            </Button>
                            <Button
                                type="submit"
                                mode={BtnModes.PRIMARY}
                                size={BtnSizes.SMALL}
                                disabled={loading || !note.trim()}
                            >
                                Zapisz
                            </Button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ListedItemNoteField;
