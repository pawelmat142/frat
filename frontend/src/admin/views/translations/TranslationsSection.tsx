import React from 'react';
import Loading from "global/components/Loading";
import { useState } from "react";
import { userAdminPanelContext } from "../AdminPanelProvider";
import Button from "global/components/controls/Button";
import Input from "global/components/controls/Input";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { toast } from "react-toastify";
import IconButton from "global/components/controls/IconButon";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { TranslationI } from "@shared/interfaces/TranslationI";
import { AdminImportService } from "admin/services/AdminImport.service";
import SelectFileButton from "global/components/selector/SelectFileButton";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { TranslationService } from "global/services/Translation.service";
import { TranslationAdminService } from "admin/services/TranslationAdmin.service";
import { useConfirm } from 'global/providers/PopupProvider';

const TranslationsSection: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newPath, setNewPath] = useState('');
    const [newValue, setNewValue] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const confirm = useConfirm();
    const ctx = userAdminPanelContext();
    const translation = ctx?.translation;
    
    const itemsPerPage = 15;

    if (!translation?.translations) {
        return null
    }

    const selectedTranslation: TranslationI | undefined = translation.translations.find(t => t.langCode === translation.selectedLanguage);
    const defaultTranslation: TranslationI | undefined = translation.translations.find(t => t.langCode === 'en');

    const handleImportTranslation = async (file: File) => {
        try {
            setLoading(true);
            const text = await file.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                toast.error("Invalid JSON file.");
                return;
            }

            await TranslationAdminService.import(data);

            TranslationService.clearCache();

            toast.success("Translations imported successfully.")
            if (selectedTranslation?.langCode) {
                translation.loadLanguage?.(selectedTranslation.langCode);
            }
        } catch (e) { }
        finally {
            setLoading(false);
        }
    }

    if (!defaultTranslation || !translation?.selectedLanguage) {
        return (
            <div className="error-color mt-10 text-center">
                Default language (en) translation not found. Please ensure it exists.<br />
                <div className="flex justify-center mt-4">
                    <SelectFileButton onFileSelected={handleImportTranslation} label="Import JSON" />
                </div>
            </div>
        );
    }

    const onSave = async () => {
        try {
            setLoading(true);
            await translation.saveTranslation?.(selectedTranslation!);
            toast.success('Translations saved successfully.');
        } catch (e) { } finally {
            setLoading(false);
        }
    }

    const isDefaultLangSelected = selectedTranslation?.langCode === defaultTranslation.langCode;

    const onShowForm = (key?: string) => { // if key is provided, we are editing
        if (showForm) {
            setShowForm(false);
            setNewPath('');
            setNewValue('');
        } else {
            setEditMode(!!key);
            setShowForm(true);
            setNewPath(key || '');
            setNewValue(key ? selectedTranslation?.data[key] ?? '' : '');
        }
    }

 
    const removeTranslation = async (key: string) => {
        const confirmed = await confirm({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete the translation for key "${key}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
        if (!confirmed) return;
        if (selectedTranslation) {
            ObjUtil.deleteValueFromNestedJsonByPath(selectedTranslation.data, key);
            translation.updateTranslation?.(selectedTranslation);
        }
    }

    const onAddTranslation = () => {
        if (selectedTranslation) {
            if (!editMode && Object.keys(selectedTranslation.data).includes(newPath)) {
                toast.error('This key already exists in the translation.');
                return;
            }

            // jesli newKey ma kropki w sobie to rozbij to na czesci i zagniezdz w obiekcie
            ObjUtil.setValueInNestedJsonByPath(selectedTranslation.data, newPath, newValue);
            translation.updateTranslation?.(selectedTranslation);
        }
        onShowForm();
    }

    const handleExportTranslation = async () => {
        if (!selectedTranslation) return;
        try {
            setLoading(true);
            await AdminImportService.exportTranslationJson(selectedTranslation?.langCode);
        } catch (e) { } finally {
            setLoading(false);
        }
    }

    const keys = selectedTranslation ? ObjUtil.getPathsFromNestedJsonKeys(selectedTranslation.data) : [];

    // Filter keys based on search text (search in both key and translation value)
    const filteredKeys = keys.filter(key => {
        if (!searchText) return true;
        const value = ObjUtil.getValueFromNestedJsonByPath(selectedTranslation?.data, key);
        const lowerSearch = searchText.toLowerCase();
        return key.toLowerCase().includes(lowerSearch) || 
               (typeof value === 'string' && value.toLowerCase().includes(lowerSearch));
    });

    // Pagination
    const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    // All early returns after ALL hooks (including useEffect)
    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <div className="flex gap-2 mb-10 mt-20">
                <Button onClick={() => onShowForm()} mode={BtnModes.PRIMARY_TXT}>
                    {showForm ? 'Cancel' : 'Add translation'}
                </Button>

                {showForm ?
                    <Button onClick={onAddTranslation} disabled={!newPath || !newValue}>Ready</Button>
                    :
                    <Button onClick={onSave}>Save translations</Button>
                }

                {selectedTranslation && (
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={handleExportTranslation}
                    >Export JSON ({selectedTranslation.langCode})</Button>
                )}

                <SelectFileButton onFileSelected={handleImportTranslation} label="Import JSON" />

            </div>

            <h2 className="font-mono font-bold mb-2 mt-10">Selected language: {translation?.selectedLanguage}</h2>

            {/* Search input and Pagination in one row */}
            <div className="flex gap-4 mb-4 items-center">
                <div className="flex-[1]">
                    <Input 
                        name="search" 
                        label="Search translations" 
                        fullWidth
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                {totalPages > 1 && (
                    <div className="flex-[2] flex justify-end items-center gap-4">
                        <Button 
                            mode={BtnModes.PRIMARY_TXT} 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="secondary-text whitespace-nowrap">
                            Page {currentPage} of {totalPages} ({filteredKeys.length} {searchText ? 'filtered' : 'total'} items)
                        </span>
                        <Button 
                            mode={BtnModes.PRIMARY_TXT} 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Formularz dodawania nowego tłumaczenia nad tabelą */}
            {showForm && !editMode && (
                <div className="flex gap-5 mb-2 mt-2 px-6 py-3 items-center">
                    <Input name="key" label="Key" className="flex-1" fullWidth
                        disabled={editMode}
                        value={newPath}
                        onChange={(e) => setNewPath(e.target.value)}
                    />
                    <Input name="value" label="Translation" className="flex-1" value={newValue} fullWidth onChange={(e) => setNewValue(e.target.value)} />
                    <Button onClick={onAddTranslation} disabled={!newPath || !newValue} className='h-fit'>Ready</Button>
                    <Button mode={BtnModes.PRIMARY_TXT} onClick={() => onShowForm()} className='h-fit'>Cancel</Button>
                </div>
            )}

            {selectedTranslation && (<div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Key</th>
                            {!isDefaultLangSelected && <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text"> Default translation ({defaultTranslation.langCode})</th>}
                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Translation</th>
                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text text-right">Version: {selectedTranslation?.version}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredKeys.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-6 secondary-text text-center">
                                    {searchText ? 'No translations found matching your search.' : 'No translations found.'}
                                </td>
                            </tr>
                        ) : (
                            paginatedKeys?.map((key, idx) => {
                                const value = ObjUtil.getValueFromNestedJsonByPath(selectedTranslation?.data, key);
                                const defaultValue = ObjUtil.getValueFromNestedJsonByPath(defaultTranslation.data, key);
                                const isEditing = showForm && newPath === key;
                                return (
                                    <React.Fragment key={idx}>
                                        <tr className="transition">
                                            <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{key}</td>
                                            {!isDefaultLangSelected && <th className="px-6 py-3 border-b border-color font-mono text-base primary-text">{defaultValue}</th>}
                                            <td className="px-6 py-3 border-b border-color primary-text">{value || '-'}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">
                                                <div className="flex gap-2 justify-end">
                                                    <IconButton icon={<EditIcon />} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY} onClick={() => onShowForm(key)} />
                                                    <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR_TXT} onClick={() => removeTranslation(key)} />
                                                </div>
                                            </td>
                                        </tr>
                                        {isEditing && (
                                            <tr>
                                                <td colSpan={isDefaultLangSelected ? 3 : 4}>
                                                    <div className="flex gap-5 mb-2 mt-2 px-6 py-3 items-center">
                                                        <Input name="key" label="Key" className="flex-1" fullWidth
                                                            disabled={editMode}
                                                            value={newPath}
                                                            onChange={(e) => setNewPath(e.target.value)}
                                                        />
                                                        <Input name="value" label="Translation" className="flex-1" value={newValue} fullWidth onChange={(e) => setNewValue(e.target.value)} />
                                                        <Button onClick={onAddTranslation} disabled={!newPath || !newValue}>Ready</Button>
                                                        <Button mode={BtnModes.PRIMARY_TXT} onClick={() => onShowForm()}>Cancel</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>

            </div>)}

        </>
    )
}

export default TranslationsSection;