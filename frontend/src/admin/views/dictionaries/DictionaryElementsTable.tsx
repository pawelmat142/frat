import React from 'react';
import IconButton from 'global/components/controls/IconButon';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { BtnModes, BtnSizes } from 'global/interface/controls.interface';
import { DictionaryColumnTypes, DictionaryElement, DictionaryI } from '@shared/interfaces/DictionaryI';
import { useNavigate } from 'react-router-dom';
import { Path } from '../../../path';
import { useTranslation } from 'react-i18next';
import { DateUtil } from '@shared/utils/DateUtil';
import { AppConfig } from '@shared/AppConfig';
import { DictionaryUtil } from '@shared/utils/DictionaryUtil';

interface Props {
    dictionary: DictionaryI;
    elements: DictionaryElement[];
    onDeleteElement: (elementCode: string) => void;
}

const DictionaryElementsTable: React.FC<Props> = ({
    dictionary,
    elements,
    onDeleteElement,
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const displayElementValue = (value: any, columnType: string, isTranslatable: boolean = false) => {
        return DictionaryUtil.displayElementValue(value, columnType, t, isTranslatable);
    };

    const handleEditDictionary = () => {
        navigate(Path.getEditDictionaryPath(dictionary.code));
    };

    const handleEditElement = (elementCode: string) => {
        navigate(Path.getEditDictionaryElementPath(dictionary.code, elementCode));
    };

    return (
        <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">CODE</th>
                        {dictionary.columns.map(col => (
                            <th key={col.code} className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">
                                {col.required && (<span>*</span>)}
                                <span>{col.code}</span>
                                {col.translatable && (<span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">T</span>)}
                            </th>
                        ))}
                        <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Status</th>
                        <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">
                            <IconButton
                                className="w-fit ml-auto"
                                icon={<EditIcon />}
                                size={BtnSizes.SMALL}
                                mode={BtnModes.PRIMARY}
                                onClick={handleEditDictionary}
                            />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {elements.length === 0 ? (
                        <tr>
                            <td colSpan={3 + dictionary.columns.length + 1} className="px-6 py-6 secondary-text text-center">No elements found.</td>
                        </tr>
                    ) : (
                        elements.map(el => (
                            <React.Fragment key={el.code}>
                                <tr>
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
                                    <td className="px-6 py-3 border-b border-color">
                                        <div className="flex gap-2 justify-end">
                                            <IconButton icon={<EditIcon />} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY} onClick={() => handleEditElement(el.code)} />
                                            <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR_TXT} onClick={() => onDeleteElement(el.code)} />
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DictionaryElementsTable;
