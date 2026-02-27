import { TranslationItemDto } from "@shared/interfaces/TranslationI";
import { TranslationAdminService } from "admin/services/TranslationAdmin.service";
import { userAdminPanelContext } from "../AdminPanelProvider";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import FloatingInput from "global/components/controls/FloatingInput";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Path } from "../../../path";

const TranslationItemForm: React.FC = () => {

    const params = useParams<{ path?: string }>();
    const path = params.path;
    const navigate = useNavigate();
    const ctx = userAdminPanelContext();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [translationItem, setTranslationItem] = useState<TranslationItemDto | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});

    useEffect(() => {
        const init = async () => {
            if (path) {
                try {
                    setLoading(true);
                    const item = await TranslationAdminService.getTranslationItem(path);
                    setTranslationItem(item);
                    setFormData({ ...item.translation });
                } catch (error) {
                    setTranslationItem(null);
                    console.error("Error fetching translation item:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setTranslationItem(null);
                setLoading(false);
            }
        };
        init();
    }, [path]);

    const handleChange = (langCode: string, value: string) => {
        setFormData(prev => ({ ...prev, [langCode]: value }));
    };

    const hasChanges = (): boolean => {
        if (!translationItem) return false;
        return Object.keys(formData).some(
            key => formData[key] !== (translationItem.translation[key] ?? '')
        ) || Object.keys(formData).length !== Object.keys(translationItem.translation).length;
    };

    const handleSave = async () => {
        if (!translationItem || !path) return;
        try {
            setSaving(true);
            await TranslationAdminService.patchTranslationItem({
                path,
                translation: formData,
            });
            setTranslationItem({ path, translation: { ...formData } });
            toast.success("Translation saved.");
        } catch {
            toast.error("Failed to save translation.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!translationItem) {
        return (
            <div className="w-full px-5 py-3">
                <Button onClick={() => navigate(Path.ADMIN_TRANSLATIONS)} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT} className="ripple mb-2">
                    ← Back
                </Button>
                <p className="error-color mt-4 text-center">Translation item not found.</p>
            </div>
        );
    }

    const langCodes = Object.keys(translationItem.translation);
    return (
        <div className="w-full px-5 py-3">

            <Button onClick={() => navigate(Path.ADMIN_TRANSLATIONS)} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT} className="ripple mb-2">
                ← Back
            </Button>

            <div className="flex flex-col gap-4 p-6 rounded-lg mt-4 max-w-2xl mx-auto mb-20 secondary-bg shadow border border-color">

                <h2 className="text-lg font-bold primary-text">Edit Translation</h2>

                <div className="flex items-center gap-2 mt-2">
                    <span className="secondary-text text-sm font-semibold">Path:</span>
                    <span className="font-mono primary-text">{translationItem.path}</span>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                    {langCodes.map(langCode => {
                        return (
                            <FloatingInput
                                key={langCode}
                                name={langCode}
                                label={langCode}
                                value={formData[langCode] ?? ''}
                                onChange={e => handleChange(langCode, e.target.value)}
                                fullWidth
                            />
                        );
                    })}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        mode={BtnModes.SECONDARY}
                        size={BtnSizes.SMALL}
                        onClick={() => navigate(Path.ADMIN_TRANSLATIONS)}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode={BtnModes.PRIMARY}
                        size={BtnSizes.SMALL}
                        onClick={handleSave}
                        disabled={saving || !hasChanges()}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TranslationItemForm;