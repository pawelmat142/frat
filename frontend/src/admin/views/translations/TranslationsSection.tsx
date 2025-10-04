import Loading from "global/components/Loading";
import { useState } from "react";
import { userAdminPanelContext } from "../AdminPanelProvider";
import Buton from "global/components/controls/Buton";
import Input from "global/components/controls/Input";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { toast } from "react-toastify";
import IconButton from "global/components/controls/IconButon";
import EditIcon from '@mui/icons-material/Edit';
import { TranslationI } from "@shared/interfaces/TranslationI";
import { AdminImportService } from "admin/services/AdminImport.service";
import SelectFileButton from "global/components/controls/SelectFileButton";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { TranslationService } from "global/services/Translation.service";
import { TranslationAdminService } from "admin/services/TranslationAdmin.service";

const TranslationsSection: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const { translation } = userAdminPanelContext();

    const [showForm, setShowForm] = useState(false);

    const [newPath, setNewPath] = useState('');
    const [newValue, setNewValue] = useState('');
    const [editMode, setEditMode] = useState(false);

    if (!translation?.selectedLanguage || !translation?.translations) {
        return null
    }

    const selectedTranslation: TranslationI | undefined = translation.translations.find(t => t.langCode === translation.selectedLanguage);
    const defaultTranslation: TranslationI | undefined = translation.translations.find(t => t.langCode === 'en');

    if (!defaultTranslation) {
        return <div className="error-color mt-10 text-center">Default language (en) translation not found. Please ensure it exists.</div>
    }

    const onSave = async () => {
        try {
            setLoading(true);
            await translation.saveTranslation?.(selectedTranslation!);
            toast.success('Translations saved successfully.');
        } catch (e) {} finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Loading />;
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
        } catch (e) {}
        finally {
            setLoading(false);
        }
    }

    const handleExportTranslation = async () => {
        if (!selectedTranslation) return;
        try {
            setLoading(true);
            await AdminImportService.exportTranslationJson(selectedTranslation?.langCode);
        } catch (e) {} finally {
            setLoading(false);
        }
    }

    const keys = selectedTranslation ? ObjUtil.getPathsFromNestedJsonKeys(selectedTranslation.data) : [];

    return (
        <>
            <h2 className="font-mono font-bold mb-2 mt-10">Selected language: {translation?.selectedLanguage}</h2>

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
                        {keys.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-6 secondary-text text-center">No translations found.</td>
                            </tr>
                        ) : (
                            keys?.map((key, idx) => {
                                const value = ObjUtil.getValueFromNestedJsonByPath(selectedTranslation?.data, key);
                                const defaultValue = ObjUtil.getValueFromNestedJsonByPath(defaultTranslation.data, key);
                                return (
                                    <tr
                                        key={idx}
                                        className="transition"
                                    >
                                        <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{key}</td>
                                        {!isDefaultLangSelected && <th className="px-6 py-3 border-b border-color font-mono text-base primary-text">{defaultValue}</th>}
                                        <td className="px-6 py-3 border-b border-color primary-text">{value || '-'}</td>
                                        <td className="px-6 py-3 border-b border-color primary-text">
                                            <div className="flex gap-2 justify-end">
                                                <IconButton icon={<EditIcon />} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY} onClick={() => onShowForm(key)} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

            </div>)}

            {showForm && (
                <div className="flex gap-5 mb-2 mt-5">
                    <Input name="key" label="Key" className="flex-1" fullWidth
                        disabled={editMode}
                        value={newPath}
                        onChange={(e) => setNewPath(e.target.value)}
                    />
                    <Input name="value" label="Translation" className="flex-1" value={newValue} fullWidth onChange={(e) => setNewValue(e.target.value)} />
                </div>
            )
            }

            <div className="flex gap-2 my-10">
                <Buton onClick={() => onShowForm()} mode={BtnModes.PRIMARY_TXT}>
                    {showForm ? 'Cancel' : 'Add translation'}
                </Buton>

                {showForm ?
                    <Buton onClick={onAddTranslation} disabled={!newPath || !newValue}>Ready</Buton>
                    :
                    <Buton onClick={onSave}>Save translations</Buton>
                }

                {selectedTranslation && (
                    <Buton
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={handleExportTranslation}
                    >Export JSON ({selectedTranslation.langCode})</Buton>
                )}

                <SelectFileButton onFileSelected={handleImportTranslation} label="Import JSON" />

            </div>

        </>
    )
}

export default TranslationsSection;