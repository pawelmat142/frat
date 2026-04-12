import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListedItemNote, UserListedItem } from '@shared/interfaces/UserListedItem';
import FloatingTextarea from 'global/components/controls/FloatingTextarea';
import Button from 'global/components/controls/Button';
import { BtnModes, BtnSizes } from 'global/interface/controls.interface';
import { UserListedItemService } from 'user/services/UserListedItemService';
import SkeletonControl from 'global/components/controls/SkeletonControl';
import { useUserContext } from 'user/UserProvider';
import { toast } from 'react-toastify';
import DateDisplay from 'global/components/ui/DateDisplay';
import { useTranslation } from 'react-i18next';
import IconButton from 'global/components/controls/IconButon';
import { Ico } from 'global/icon.def';
import { useConfirm } from 'global/providers/PopupProvider';

interface ListedItemNoteFieldProps {
    item: UserListedItem;
    open: boolean;
    onClose: () => void;
}

const ListedItemNoteField: React.FC<ListedItemNoteFieldProps> = ({ item, open, onClose }) => {

    const userCtx = useUserContext();
    const { t } = useTranslation();
    const confirm = useConfirm();

    const [note, setNote] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!note.trim()) return;
        setLoading(true);
        try {
            if (!editingNoteId) {
                await addNoteProcess(note.trim());
            } else {
                await editNoteProcess(note.trim());
            }
            noteSaveSuccess();
        } finally {
            setLoading(false);
        }
    };


    const noteSaveSuccess = () => {
        setNote('');
        setEditingNoteId(null);
        onClose();
    }

    const editNoteProcess = async (newContent: string) => {
        if (!userCtx.meCtx) {
            return;
        }
        const updatedNote = await UserListedItemService.updateNote({
            noteId: editingNoteId!,
            listItemId: item.id,
            note: newContent
        })
        userCtx.updateMeCtx({
            ...userCtx.meCtx,
            listedItems: userCtx.meCtx?.listedItems?.map(li => {
                if (li.id === item.id) {
                    return {
                        ...li,
                        notes: li.notes?.map(n => n.id === updatedNote.id ? updatedNote : n)
                    }
                }
                return li;
            }) || []
        })
    }

    const addNoteProcess = async (noteContent: string) => {
        if (!userCtx.meCtx) {
            return;
        }
        const newNote = await UserListedItemService.addNote({
            listItemId: item.id,
            note: noteContent,
        })
        userCtx.updateMeCtx({
            ...userCtx.meCtx,
            listedItems: userCtx.meCtx?.listedItems?.map(li => {
                if (li.id === item.id) {
                    return {
                        ...li,
                        notes: [...(li.notes || []), newNote]
                    }
                }
                return li;
            }) || []
        });
    }

    const onEdit = async (note: ListedItemNote) => {
        setEditingNoteId(note.id);
        setNote(note.note);
    }

    const onRemoveNote = async (noteId: string) => {
        if (!userCtx.meCtx) {
            return;
        }
        const confirmed = await confirm({
            title: "Czy na pewno chcesz usunąć tę notatkę?",
            message: "Ta akcja jest nieodwracalna",
        })
        if (!confirmed) {
            return;
        }
        try {
            setLoading(true);
            await UserListedItemService.removeNote(item.id.toString(), noteId);
            userCtx.updateMeCtx({
                ...userCtx.meCtx,
                listedItems: userCtx.meCtx?.listedItems?.map(li => {
                    if (li.id === item.id) {
                        return {
                            ...li,
                            notes: li.notes?.filter(n => n.id !== noteId)
                        }
                    }
                    return li;
                }) || []
            });
            toast.success("Notatka usunięta");
        }
        finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingNoteId(null);
        setNote('');
        onClose();
    };

    const onSetShowNoteButtons = (noteId: string) => {
        setSelectedNoteId(prev => prev === noteId ? null : noteId);
    }

    const openInput = open || !!editingNoteId

    if (loading) {
        return <SkeletonControl></SkeletonControl>
    }
    // TODO translacje
    return (
        <div>

            <AnimatePresence>
                {!openInput && !!item.notes?.length &&

                    <motion.div
                        key="note-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="py-1 px-2 secondary-bg rounded-md mx-2 mb-2">
                            {item.notes?.map(note => {
                                return (
                                    <div className='ripple rounded-md flex justify-between' key={note.id} onClick={() => onSetShowNoteButtons(note.id)}>
                                        <div className='flex-1'>
                                            <span className='secondary-text s-font'>{`(${DateDisplay({ date: new Date(note.date), t, showTimeIfToday: true })})  `}</span>
                                            <span>{note.note}</span>
                                        </div>
                                        {selectedNoteId === note.id && <div className='flex justify-end transition'>
                                            <IconButton onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemoveNote(note.id); }} mode={BtnModes.ERROR_TXT} icon={<Ico.DELETE size={20} />}></IconButton>
                                            <IconButton onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(note); }} mode={BtnModes.PRIMARY_TXT} icon={<Ico.EDIT size={20} />}></IconButton>
                                        </div>}
                                    </div>
                                );
                            })}

                        </div>

                    </motion.div>
                }

            </AnimatePresence>


            <AnimatePresence>

                {openInput && (
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
        </div>
    );
};

export default ListedItemNoteField;
