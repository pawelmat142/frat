import React, { useCallback } from "react";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useConfirm } from "global/providers/PopupProvider";
import { DictionaryElement, DictionaryGroup, DictionaryI } from "@shared/interfaces/DictionaryI";
import { UserRoles } from "@shared/interfaces/UserI";
import RoleGuard from "global/components/RoleGuard";
import { useTranslation } from "react-i18next";
import { Path } from '../../../path';
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import { useNavigate } from "react-router-dom";
import SearchAndPagination from "admin/components/SearchAndPagination";
import { useFilteredPagination } from "admin/hooks/useFilteredPagination";

const GROUPS_PER_PAGE = 5;
const GROUP_ELEMENTS_PER_PAGE = 10;

interface DictionaryGroupsProps {
    dictionary: DictionaryI;
    onRemoveGroup?: (group: DictionaryGroup) => void;
}

interface DictionaryGroupSectionProps {
    group: DictionaryGroup;
    dictionary: DictionaryI;
    onEdit: (group: DictionaryGroup) => void;
    onRemove: (group: DictionaryGroup) => void;
}

const DictionaryGroupSection: React.FC<DictionaryGroupSectionProps> = ({ group, dictionary, onEdit, onRemove }) => {
    const { t } = useTranslation();
    const allElements = dictionary.elements || [];
    const groupElements = allElements.filter(el => group.elementCodes.includes(el.code));

    const filterElement = useCallback((element: DictionaryElement, search: string): boolean => {
        const lower = search.toLowerCase();
        if (element.code.toLowerCase().includes(lower)) return true;
        return Object.values(element.values ?? {}).some(
            v => typeof v === 'string' && v.toLowerCase().includes(lower)
        );
    }, []);

    const {
        searchText,
        setSearchText,
        currentPage,
        totalPages,
        filteredCount,
        totalItems,
        paginatedItems: paginatedElements,
        handlePageChange,
    } = useFilteredPagination(groupElements, GROUP_ELEMENTS_PER_PAGE, filterElement);

    const displayElementValue = (value: any, columnType: string, isTranslatable: boolean = false) =>
        DictionaryUtil.displayElementValue(value, columnType, t, isTranslatable);

    return (
        <div>
            <div className="font-mono font-bold mb-2">Group: {group.code}</div>

            <SearchAndPagination
                searchText={searchText}
                onSearchChange={setSearchText}
                searchLabel="Search elements in group"
                currentPage={currentPage}
                totalPages={totalPages}
                filteredCount={filteredCount}
                totalItems={totalItems}
                onPageChange={handlePageChange}
            />

            <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Code</th>
                            {dictionary.columns.map(col => (
                                <th key={col.code} className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">
                                    {col.required && <span>*</span>}
                                    <span>{col.code}</span>
                                </th>
                            ))}
                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Status</th>
                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">
                                <div className="flex gap-2 justify-end">
                                    <IconButton icon={<EditIcon />} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY} onClick={() => onEdit(group)} />
                                    <RoleGuard roles={[UserRoles.SUPERADMIN]}>
                                        <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR_TXT} onClick={() => onRemove(group)} />
                                    </RoleGuard>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedElements.length === 0 ? (
                            <tr>
                                <td colSpan={dictionary.columns.length + 3} className="px-6 py-4 secondary-text text-center">
                                    No elements in this group.
                                </td>
                            </tr>
                        ) : (
                            paginatedElements.map(el => (
                                <tr key={el.code}>
                                    <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{el.code}</td>
                                    {dictionary.columns.map(col => (
                                        <td key={col.code} className="px-6 py-3 border-b border-color primary-text">
                                            {displayElementValue(el.values[col.code], col.type, col.translatable)}
                                        </td>
                                    ))}
                                    <td className="px-6 py-3 border-b border-color">
                                        {el.active
                                            ? <span className="primary-color font-semibold">ACTIVE</span>
                                            : <span className="secondary-text">INACTIVE</span>}
                                    </td>
                                    <td className="px-6 py-3 border-b border-color"></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DictionaryGroups: React.FC<DictionaryGroupsProps> = ({ dictionary, onRemoveGroup }) => {
    const groups = dictionary.groups || [];
    const navigate = useNavigate();
    const confirm = useConfirm();

    const filterGroup = useCallback((group: DictionaryGroup, search: string): boolean => {
        const lower = search.toLowerCase();
        return group.code.toLowerCase().includes(lower) ||
            (group.description ?? '').toLowerCase().includes(lower);
    }, []);

    const {
        searchText,
        setSearchText,
        currentPage,
        totalPages,
        filteredCount,
        totalItems,
        paginatedItems: paginatedGroups,
        handlePageChange,
    } = useFilteredPagination(groups, GROUPS_PER_PAGE, filterGroup);

    const handleEditDictionaryGroup = (group: DictionaryGroup) => {
        navigate(Path.getDictionaryGroupFormPath(dictionary.code, group.code));
    };

    const handleRemoveDictionaryGroup = async (group: DictionaryGroup) => {
        const confirmed = await confirm({
            title: "Remove Dictionary Group",
            message: "Are you sure you want to remove this group? Remember, save is required!",
        });
        if (!confirmed) return;
        onRemoveGroup?.(group);
    };

    if (groups.length === 0) {
        return <div className="secondary-text">No groups available.</div>;
    }

    return (
        <div className="flex flex-col gap-8 mt-20">
            <h2 className="text-xl font-bold primary-text">Groups in dictionary: {dictionary.code}</h2>

            <SearchAndPagination
                searchText={searchText}
                onSearchChange={setSearchText}
                searchLabel="Search groups"
                currentPage={currentPage}
                totalPages={totalPages}
                filteredCount={filteredCount}
                totalItems={totalItems}
                onPageChange={handlePageChange}
            />

            {paginatedGroups.map(group => (
                <DictionaryGroupSection
                    key={group.code}
                    group={group}
                    dictionary={dictionary}
                    onEdit={handleEditDictionaryGroup}
                    onRemove={handleRemoveDictionaryGroup}
                />
            ))}
        </div>
    );
};

export default DictionaryGroups;
