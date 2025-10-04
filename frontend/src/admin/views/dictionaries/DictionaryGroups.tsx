import React from "react";
import { Util } from "@shared/utils/util";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useConfirm } from "global/providers/PopupProvider";
import { DictionaryColumnTypes, DictionaryGroup, DictionaryI } from "@shared/interfaces/DictionaryI";

interface DictionaryGroupsProps {
    dictionary: DictionaryI;
    onRemoveGroup?: (group: DictionaryGroup) => void;
    onEditGroup?: (group: DictionaryGroup) => void;
}

const DictionaryGroups: React.FC<DictionaryGroupsProps> = ({ dictionary, onRemoveGroup, onEditGroup }) => {
    const groups = dictionary.groups || [];
    const elements = dictionary.elements || [];

    if (!groups || groups.length === 0) {
        return <div className="secondary-text">No groups available.</div>;
    }

    const confirm = useConfirm();

    const handleEditDictionaryGroup = async (group: DictionaryGroup) => {
        onEditGroup?.(group);
    }
    
    const handleRemoveDictionaryGroup = async (group: DictionaryGroup) => {
        const confirmed = await confirm({
            title: "Remove Dictionary Group",
            message: "Are you sure you want to remove this group?",
        });
        if (!confirmed) return;
            onRemoveGroup?.(group);
    }

    return (
        <div className="flex flex-col gap-8 mt-20">
            <h2 className="text-xl font-bold primary-text">Groups in dictionary: {dictionary.code}</h2>
            {groups.map((group, idx) => {
                const groupElements = elements.filter(el => group.elementCodes.includes(el.code));
                return (
                    <div key={group.code} className="">
                        <div className="font-mono font-bold mb-2">Group: {group.code}</div>
                        {groupElements.length === 0 ? (
                            <div className="secondary-text">No elements in this group.</div>
                        ) : (
                            <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Code</th>
                                            {dictionary.columns.map(col => (
                                                <th key={col.code} className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">
                                                    {col.required && (<span>*</span>)}
                                                    <span>{col.code}</span>
                                                </th>
                                            ))}
                                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Status</th>

                                            <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">
                                                <div className="flex gap-2 justify-end">
                                                    <IconButton icon={<EditIcon />} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY} onClick={() => handleEditDictionaryGroup(group)} />
                                                    <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR} onClick={() => handleRemoveDictionaryGroup(group)} />
                                                </div>
                                            </th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupElements.map(el => (
                                            <tr key={el.code}>
                                                <td className={"px-6 py-3 border-b border-color font-mono text-base primary-text"}>{el.code}</td>
                                                {dictionary.columns.map(col => (
                                                    <td key={col.code} className="px-6 py-3 border-b border-color primary-text">
                                                        {col.type === DictionaryColumnTypes.DATE
                                                            ? Util.displayDate(el.values[col.code])
                                                            : (el.values[col.code] !== undefined && el.values[col.code] !== "" ? el.values[col.code] : "-")}
                                                    </td>
                                                ))}
                                                <td className={"px-6 py-3 border-b border-color"}>{el.active ? <span className="primary-color font-semibold">ACTIVE</span> : <span className="secondary-text">INACTIVE</span>}</td>
                                                <td className={"px-6 py-3 border-b border-color "}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default DictionaryGroups;
