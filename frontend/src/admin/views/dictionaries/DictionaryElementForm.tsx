import React, { useEffect, useState } from "react";
import Checkbox from "global/components/controls/Checkbox";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import TypedInput from "global/components/controls/TypedInput";
import { DictionaryI, DictionaryColumnTypes, DictionaryElementWithGroups } from "@shared/interfaces/DictionaryI";
import { userAdminPanelContext } from "../AdminPanelProvider";
import FloatingInput from "global/components/controls/FloatingInput";
import Loading from "global/components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { DictionaryAdminService } from "admin/services/DictionaryAdmin.service";
import { useTranslation } from "react-i18next";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { useGlobalContext } from "global/providers/GlobalProvider";

const DictionaryElementForm: React.FC = () => {

    const { code, elementCode } = useParams<{ code: string, elementCode: string }>();
    const navigate = useNavigate();
    const adminPanelCtx = userAdminPanelContext();
    const globalCtx = useGlobalContext();
    const languages = globalCtx.getLanguagesList();
    const { t } = useTranslation();
    const confirm = useConfirm();

    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
    const [loading, setLoading] = useState(false);
    const [elementForm, setElementForm] = useState<DictionaryElementWithGroups | null>()

    const isNewElement = !elementCode

    useEffect(() => {
        if (!code) return;
        setLoading(true);
        const initDctionary = async () => {
            try {
                const dict = await DictionaryAdminService.getDictionary(code);
                setDictionary(dict || null);

                if (!dict) {
                    return
                }
                if (isNewElement) {
                    setElementForm({
                        code: '',
                        description: '',
                        active: true,
                        values: Object.fromEntries(dict.columns.map(col => {
                            if (col.translatable) {
                                const translations = Object.fromEntries(languages.map(lang => [lang, '']))
                                return [col.code, translations]
                            }
                            return [col.code, null]
                        })),
                        groups: []
                    })
                }
                const element = dict?.elements.find(el => el.code === elementCode);
                if (!element) {
                    console.warn(` TODO Element with code ${elementCode} not found in dictionary ${code}`);
                    return
                }
                setElementForm({
                    ...element,
                    values: Object.fromEntries(
                        Object.entries(element.values).map(([key, value]) => {
                            const column = dict.columns.find(col => col.code === key);
                            if (column?.translatable) {
                                const translationKey = value
                                const translations: { [langCode: string]: string } = {};
                                languages.forEach(language => {
                                    const translated = t(translationKey, { lng: language });
                                    translations[language] = translated !== translationKey ? translated : '';
                                })
                                return [key, translations];
                            }
                            return [key, value];
                        })
                    ),
                    groups: dict.groups.filter(group => group.elementCodes.includes(element.code)).map(group => group.code)
                })
            } catch (e) {
                console.error("Failed to load dictionary:", e);
                setDictionary(null);
            }
            finally {
                setLoading(false);
            }
        }
        initDctionary();
    }, [])


    const submitForm = async () => {
        if (!elementForm || !dictionary) return;
        const confirmed = await confirm({
            title: isNewElement ? "Add new element?" : "Update element?",
            message: isNewElement ? "Are you sure you want to add this new element to the dictionary?" : "Are you sure you want to update this element?",
        })
        if (!confirmed) return;
        try {
            setLoading(true);
            if (!elementForm || !dictionary) return;
            if (!elementForm || !dictionary) return;
            const result = await DictionaryAdminService.putElement(elementForm, dictionary!.code);
            toast.success(isNewElement ? "Element added successfully" : "Element updated successfully");
            navigate(-1);
        }
        finally {
            setLoading(false);
        }
    }

    const onCancel = () => {
        navigate(-1);
    }

    const initLanguages = async () => {
        try {
            setLoading(true);
            if (!adminPanelCtx?.translation?.languages?.length) {
                await adminPanelCtx?.translation?.initTranslations();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initLanguages();
    }, []);

    if (!elementForm) {
        return <Loading></Loading>
    }

    const onElementChange = (elementCode: string, value: string | number | null, langCode?: string) => {
        if (langCode) {
            const newElementForm = {
                ...elementForm,
                values: {
                    ...elementForm?.values,
                    [elementCode]: {
                        ...elementForm?.values?.[elementCode],
                        [langCode]: value
                    }
                }
            }
            setElementForm(newElementForm);
            return
        }
        const newElementForm: DictionaryElementWithGroups = {
            ...elementForm,
            values: {
                ...elementForm?.values,
                [elementCode]: value
            }
        };
        setElementForm(newElementForm);
    };

    const onElementChangeDate = (elementCode: string, date: Date | null) => {
        const newElementForm = {
            ...elementForm,
            values: {
                ...elementForm?.values,
                [elementCode]: date
            }
        };
        setElementForm(newElementForm);
    };

    if (!dictionary || loading) {
        return <Loading />;
    }

    return (

        <div className="p-6">
            <div className="flex flex-col gap-4 w-full">
                <Button onClick={() => navigate(-1)} mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} className="ripple">
                    ← Back
                </Button>

                <h3 className="text-xl font-bold mb-4">{isNewElement ? "Add Dictionary Element" : "Edit Dictionary Element"}</h3>

                <FloatingInput
                    name="elementCode"
                    label="Element Code"
                    value={elementForm?.code || ""}
                    onChange={e => setElementForm({ ...elementForm, code: e.target.value })}
                    required
                    fullWidth
                    disabled={!isNewElement}
                />
                <FloatingInput
                    name="elementDescription"
                    label="Description"
                    value={elementForm?.description || ""}
                    onChange={e => setElementForm({ ...elementForm, description: e.target.value })}
                    fullWidth
                />

                <div className="mb-4">
                    <Checkbox
                        checked={elementForm?.active ?? true}
                        onChange={checked => setElementForm({ ...elementForm, active: checked })}
                        label="Active"
                    />
                </div>


                {dictionary.columns.map(col => {

                    const value = elementForm?.values?.[col.code] || ""

                    return (
                        <div key={col.code} className="space-y-3">
                            {col.type !== DictionaryColumnTypes.BOOLEAN && (
                                <div className="flex items-center gap-2 mb-2">

                                    <h5 className="font-medium">{col.code}</h5>
                                    <span className="text-sm text-gray-500">({col.type})</span>
                                    {col.translatable && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">translatable</span>}
                                    {col.required && <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">required</span>}
                                </div>
                            )}

                            {col.translatable ? (
                                Object.entries(value).map(([langCode, val]) => {
                                    return <FloatingInput
                                        key={`${col.code}_${langCode}`}
                                        name={`${col.code}_${langCode}`}
                                        label={`${langCode}`}
                                        value={String(val)}
                                        onChange={e => onElementChange(col.code, e.target.value, langCode)}
                                        fullWidth
                                    ></FloatingInput>
                                })

                            ) : (
                                <TypedInput
                                    valueType={col.type}
                                    name={col.code}
                                    label={`${col.code}${col.description ? ` (${col.type})` : ''}`}
                                    value={value}
                                    onChange={e => onElementChange(col.code, e.target.value)}
                                    onDateChange={date => onElementChangeDate(col.code, date)}
                                    required={col.required}
                                    fullWidth
                                />
                            )}
                        </div>
                    )
                })}

                {!!dictionary.groups?.length && (
                    <div className="mt-6">
                        <h5 className="font-medium border-t pt-4">Groups:</h5>

                        {dictionary.groups.map(group => (
                            <Checkbox
                                key={group.code}
                                className="mt-3"
                                checked={elementForm.groups.includes(group.code)}
                                onChange={checked => {
                                    if (checked) {
                                        setElementForm({
                                            ...elementForm,
                                            groups: [...elementForm.groups, group.code]
                                        });
                                    } else {
                                        setElementForm({
                                            ...elementForm,
                                            groups: elementForm.groups.filter(code => code !== group.code)
                                        });
                                    }
                                }}
                                label={group.code}
                            />
                        ))}

                    </div>
                )}
            </div>

            <div className="flex gap-3 justify-center mt-6 pt-4 border-t">
                <Button
                    onClick={onCancel}
                    mode={BtnModes.PRIMARY_TXT}
                >
                    Cancel
                </Button>
                <Button
                    onClick={submitForm}
                    mode={BtnModes.PRIMARY}
                    disabled={!elementForm?.code}
                >
                    {isNewElement ? 'Add Element' : 'Update Element'}
                </Button>
            </div>
        </div>

    );
};

export default DictionaryElementForm;