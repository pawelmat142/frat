import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "global/components/controls/Button";
import DictionaryElementForm from "./DictionaryElementForm";
import Loading from "global/components/Loading";
import AddIcon from '@mui/icons-material/Add';
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom";
import { Path } from "../../../path";
import { toast } from "react-toastify";
import { DictionaryAdminService } from "admin/services/DictionaryAdmin.service";
import { useConfirm } from "global/providers/PopupProvider";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DictionaryGroups from "./DictionaryGroups";
import { AdminImportService } from "admin/services/AdminImport.service";
import { DictionaryI, DictionaryElement, DictionaryGroup, DictionaryColumnTypes, DictionaryStatuses } from "@shared/interfaces/DictionaryI";
import { useTranslation } from "react-i18next";
import { DateUtil } from "@shared/utils/DateUtil";

const DictionaryView: React.FC = () => {
    const navigate = useNavigate();
    const confirm = useConfirm();

    const { code = "" } = useParams<{ code: string }>();
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
    const [loading, setLoading] = useState(false);
    const [elementForm, setElementForm] = useState<Partial<DictionaryElement> | null>(null);
    const [elementFormEditMode, setElementFormEditMode] = useState<boolean>(false);
    const [elements, setElements] = useState<DictionaryElement[]>([]);
    const { t } = useTranslation()

    const _setDictionary = (dict: DictionaryI) => {
        setDictionary(dict);
        setElements(dict.elements || []);
    }

    useEffect(() => {
        const initDictionary = async () => {
            try {
                setLoading(true);
                const result = await DictionaryAdminService.getDictionary(code, t)
                _setDictionary(result);
            } catch (e) {
            } finally {
                setLoading(false);
            }
        }
        if (!code) return;
        initDictionary();
    }, [code]);

    if (loading) {
        return <Loading />;
    }

    if (!dictionary) {
        return <div className="p-5 text-center primary-text">Dictionary not found.</div>;
    }

    const handleAddElement = () => {
        if (!elementFormEditMode && elements.some(e => e.code === elementForm?.code)) {
            toast.error("Element with this code already exists.");
            return;
        }
        // Prepare values for columns
        const values: { [key: string]: any } = {};
        dictionary.columns.forEach(col => {
            values[col.code] = elementForm?.values?.[col.code] ?? "";
        });
        if (!elementForm) return;

        if (elementFormEditMode) {
            setElements(elements.map(el => {
                if (el.code === elementForm.code) {
                    return {
                        code: elementForm.code ?? "",
                        description: elementForm.description || "",
                        active: elementForm.active ?? true,
                        values,
                    }
                }
                return el
            }))
        } else {
            const newElement: DictionaryElement = {
                code: elementForm.code ?? "",
                description: elementForm.description || "",
                active: elementForm.active ?? true,
                values,
            };
            setElements([...elements, newElement]);
        }
        setElementFormEditMode(false);
        setElementForm(null);
    };

    const handleSave = async () => {
        const updatedDictionary: DictionaryI = {
            ...dictionary,
            elements: elements
        }

        try {
            setLoading(true);
            const result = await DictionaryAdminService.putDictionary(updatedDictionary, t);
            _setDictionary(result);
            toast.success("Dictionary updated successfully.");
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!dictionary) return;

        try {
            const confirmed = await confirm({
                title: "Confirm Deletion",
                message: `Are you sure you want to delete the dictionary "${dictionary.code}"? This action cannot be undone.`,
                confirmText: "Delete",
                cancelText: "Cancel"
            });
            if (!confirmed) return;

            setLoading(true);
            await DictionaryAdminService.deleteDictionary(dictionary.code);
            toast.success("Dictionary deleted successfully.");
            navigate(Path.ADMIN_DICTIONARIES);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteElement = async (elementCode: string) => {
        if (!dictionary) return;

        try {
            const confirmed = await confirm({
                title: "Confirm Deletion",
                message: `Are you sure you want to delete the element "${elementCode}"? This action cannot be undone.`,
                confirmText: "Delete",
                cancelText: "Cancel"
            });
            if (!confirmed) {
                return;
            }

            const newElements = elements.filter(el => el.code !== elementCode);

            setLoading(true);
            const result = await DictionaryAdminService.putDictionary({
                ...dictionary,
                elements: newElements
            }, t);
            _setDictionary(result);
            toast.success("Element deleted successfully.");
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const handleEditElement = (elementCode: string) => {
        // show add element form with data populated
        const element = elements.find(el => el.code === elementCode);
        if (element) {
            setElementFormEditMode(true);
            setElementForm(element);
        }
    }

    const onAddElement = () => {
        const values: { [key: string]: any } = {};
        dictionary.columns.forEach(col => {
            if (col.required) {
                values[col.code] = col.defaultValue || "";
            }
        });
        setElementForm({ values });
    }

    const handleEditDictionary = () => {
        navigate(Path.getEditDictionaryPath(dictionary.code));
    }

    const handleEditDictionaryGroup = (group: DictionaryGroup) => {
        navigate(Path.getDictionaryGroupFormPath(dictionary.code, group.code));
    }

    const handleRemoveDictionaryGroup = async (group: DictionaryGroup) => {
        if (!dictionary) return;
        const updatedGroups = (dictionary.groups || []).filter(g => g.code !== group.code);
        setDictionary({
            ...dictionary,
            groups: updatedGroups
        });
    }

    const exportJson = () => {
        AdminImportService.exportDictionaryJson(dictionary.code);
    }

    return (
        <div className="flex flex-col gap-6 w-full px-5 pb-20 pt-10">
            <div className="w-full">
                <Button onClick={() => navigate(Path.ADMIN_DICTIONARIES)} mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} className="ripple">
                    ← Back
                </Button>
                <div className="flex items-center gap-4 mb-4 mt-10">
                    <h2 className="text-xl font-bold primary-text">Dictionary CODE: {dictionary.code}</h2>
                    <h2 className="primary-text">version: {dictionary.version}</h2>
                    <h2 className="primary-text">status: <span className="primary-color">{dictionary.status}</span> </h2>
                </div>
                {dictionary.description && (
                    <div className="mb-4 secondary-text">Description: {dictionary.description}</div>
                )}
                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">CODE</th>
                                {dictionary.columns.map(col => (
                                    <th key={col.code} className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">
                                        {col.required && (<span>*</span>)}
                                        <span>{col.code}</span>
                                    </th>
                                ))}
                                {/* <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Description</th> */}
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Status</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">
                                    <IconButton className="w-fit ml-auto"
                                        icon={<EditIcon />}
                                        size={BtnSizes.SMALL} mode={BtnModes.PRIMARY}
                                        onClick={() => handleEditDictionary()} />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {elements.length === 0 ? (
                                <tr>
                                    <td colSpan={3 + dictionary.columns.length + 1} className="px-6 py-6 secondary-text text-center">No elements found.</td>
                                </tr>
                            ) : (
                                elements.map((el, idx) => (
                                    <React.Fragment key={el.code}>
                                        <tr>
                                            <td className={"px-6 py-3 border-b border-color font-mono text-base primary-text"}>{el.code}</td>
                                            {dictionary.columns.map(col => (
                                                <td key={col.code} className="px-6 py-3 border-b border-color primary-text">
                                                    {col.type === DictionaryColumnTypes.DATE
                                                        ? DateUtil.displayDate(el.values[col.code])
                                                        : (el.values[col.code] !== undefined && el.values[col.code] !== "" ? el.values[col.code] : "-")}
                                                </td>
                                            ))}
                                            {/* <td className={"px-6 py-3 border-b border-color secondary-text"}>{el.description}</td> */}
                                            <td className={"px-6 py-3 border-b border-color"}>{el.active ? <span className="primary-color font-semibold">ACTIVE</span> : <span className="secondary-text">INACTIVE</span>}</td>
                                            <td className={"px-6 py-3 border-b border-color "}>
                                                <div className="flex gap-2 justify-end">
                                                    <IconButton icon={<EditIcon />} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY} onClick={() => handleEditElement(el.code)} />
                                                    <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR_TXT} onClick={() => handleDeleteElement(el.code)} />
                                                </div>
                                            </td>
                                        </tr>
                                        {elementFormEditMode && elementForm?.code === el.code && (
                                            <tr>
                                                <td colSpan={3 + dictionary.columns.length + 1} className="px-6 py-6 text-center">
                                                    <DictionaryElementForm
                                                        dictionary={dictionary}
                                                        elementForm={elementForm}
                                                        setElementForm={setElementForm}
                                                        onAddElement={handleAddElement}
                                                        editMode={true}
                                                        onCancel={() => {
                                                            setElementForm(null)
                                                            setElementFormEditMode(false);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                {/* Add element button and form */}
                <div className="">
                    {elementForm ? (
                        !elementFormEditMode ?
                            (<div className="flex flex-col gap-4 mt-4 secondary-bg w-full max-w-lg mx-auto mb-10">
                                <div className="flex flex-col gap-3">
                                    <DictionaryElementForm
                                        dictionary={dictionary}
                                        elementForm={elementForm}
                                        setElementForm={setElementForm}
                                        onAddElement={handleAddElement}
                                        onCancel={() => setElementForm(null)}
                                    />
                                </div>
                            </div>) : null
                    ) : (
                        <div className="flex gap-2 my-10">
                            <Button
                                onClick={() => onAddElement()}
                                mode={BtnModes.PRIMARY}
                            >
                                <AddIcon /> Add element
                            </Button>
                            <Button
                                onClick={() => handleSave()}
                                mode={BtnModes.SECONDARY}
                            >
                                Save changes
                            </Button>

                            <Button
                                onClick={() => navigate(Path.getDictionaryGroupFormPath(dictionary.code, 'new'))}
                            >
                                Add group
                            </Button>

                            <Button
                                onClick={() => setDictionary({
                                    ...dictionary,
                                    status: dictionary.status === DictionaryStatuses.ACTIVE
                                        ? DictionaryStatuses.INACTIVE
                                        : DictionaryStatuses.ACTIVE
                                })}
                                mode={BtnModes.PRIMARY_TXT}
                            >
                                {dictionary.status === DictionaryStatuses.ACTIVE
                                    ? 'Deactivate'
                                    : 'Activate'}
                            </Button>

                            <Button
                                onClick={() => exportJson()}
                                mode={BtnModes.PRIMARY_TXT}
                            >
                                Export JSON
                            </Button>

                            <Button
                                onClick={() => handleDelete()}
                                mode={BtnModes.ERROR}
                            >
                                Delete dictionary
                            </Button>

                        </div>
                    )}
                </div>

                <DictionaryGroups
                    dictionary={dictionary}
                    onRemoveGroup={handleRemoveDictionaryGroup}
                    onEditGroup={handleEditDictionaryGroup}
                />

            </div>
        </div>

    );
};

export default DictionaryView;
