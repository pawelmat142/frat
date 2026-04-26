import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "global/components/controls/Button";
import Loading from "global/components/Loading";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom";
import { Path } from "../../../path";
import { toast } from "react-toastify";
import { DictionaryAdminService } from "admin/services/DictionaryAdmin.service";
import { useConfirm } from "global/providers/PopupProvider";
import DictionaryGroups from "./DictionaryGroups";
import { DictionaryI, DictionaryElement, DictionaryGroup, DictionaryStatuses } from "@shared/interfaces/DictionaryI";
import DictionaryElementsTable from "./DictionaryElementsTable";
import DictionaryActionsBar from "./DictionaryActionsBar";
import DictionaryPagination from "./DictionaryPagination";

const DictionaryView: React.FC = () => {
    const navigate = useNavigate();
    const confirm = useConfirm();

    const { code = "" } = useParams<{ code: string }>();
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
    const [loading, setLoading] = useState(false);
    const [elements, setElements] = useState<DictionaryElement[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const _setDictionary = (dict: DictionaryI) => {
        setDictionary(dict);
        setElements(dict.elements || []);
    }

    useEffect(() => {
        const initDictionary = async () => {
            try {
                setLoading(true);
                const result = await DictionaryAdminService.getDictionary(code)
                _setDictionary(result);
            } catch (e) {
            } finally {
                setLoading(false);
            }
        }
        if (!code) return;
        initDictionary();
    }, [code]);

    useEffect(() => {
        setCurrentPage(1);
    }, [elements.length]);

    if (loading) {
        return <Loading />;
    }

    if (!dictionary) {
        return <div className="p-5 text-center primary-text">Dictionary not found.</div>;
    }

    const handleSave = async () => {
        const updatedDictionary: DictionaryI = {
            ...dictionary,
            elements: elements
        }

        try {
            setLoading(true);
            const result = await DictionaryAdminService.putDictionary(updatedDictionary);
            _setDictionary(result);
            toast.success("Dictionary updated successfully.");
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
            const result = await DictionaryAdminService.deleteElement(dictionary.code, elementCode);
            _setDictionary(result);
            toast.success("Element deleted successfully.");
        } catch (e) {

        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDictionaryGroup = async (group: DictionaryGroup) => {
        if (!dictionary) return;
        const updatedGroups = (dictionary.groups || []).filter(g => g.code !== group.code);
        setDictionary({
            ...dictionary,
            groups: updatedGroups
        });
    }

    const totalPages = Math.ceil(elements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedElements = elements.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

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

                <DictionaryPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={elements.length}
                    onPageChange={handlePageChange}
                />

                <DictionaryElementsTable
                    dictionary={dictionary}
                    elements={paginatedElements}
                    onDeleteElement={handleDeleteElement}
                />


                {/* Add element button and form */}
                <DictionaryActionsBar
                    dictionary={dictionary}
                    onSave={handleSave}
                    onToggleStatus={() => setDictionary({
                        ...dictionary,
                        status: dictionary.status === DictionaryStatuses.ACTIVE
                            ? DictionaryStatuses.INACTIVE
                            : DictionaryStatuses.ACTIVE
                    })}
                />

                <DictionaryGroups
                    dictionary={dictionary}
                    onRemoveGroup={handleRemoveDictionaryGroup}
                />

            </div>
        </div>

    );
};

export default DictionaryView;
