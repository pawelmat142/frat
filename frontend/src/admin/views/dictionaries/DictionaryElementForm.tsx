import React from "react";
import Input from "global/components/controls/Input";
import Checkbox from "global/components/controls/Checkbox";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import TypedInput from "global/components/controls/TypedInput";
import { DictionaryI, DictionaryElement } from "@shared/interfaces/DictionaryI";

interface DictionaryElementFormProps {
    dictionary: DictionaryI;
    elementForm: Partial<DictionaryElement> | null;
    setElementForm: (form: Partial<DictionaryElement> | null) => void;
    onAddElement: () => void;
    onCancel: () => void;
    editMode?: boolean;
}

const DictionaryElementForm: React.FC<DictionaryElementFormProps> = ({
    dictionary,
    elementForm,
    setElementForm,
    onAddElement,
    onCancel,
    editMode
}) => {
    const allElementRequiredFiledsFilled = dictionary.columns.every(col => !col.required || (elementForm?.values && elementForm.values[col.code]));

    const onElementChange = (elementCode: string, value: string | number | null) => {
        const newElementForm = {
            ...elementForm,
            values: {
                ...elementForm?.values,
                [elementCode]: value
            }

        };
        setElementForm(newElementForm);
    }

    const onElementChangeDate = (elementCode: string, date: Date | null) => {
        const newElementForm = {
            ...elementForm,
            values: {
                ...elementForm?.values,
                [elementCode]: date
            }
        };
        setElementForm(newElementForm);
    }

    return (
        <div className="flex flex-col gap-4 p-4 border rounded shadow w-full max-w-lg mx-auto">
            <h3 className="text-lg font-bold mb-2">{editMode ? `Update Element` : `Add Element`}</h3>
            <div className="flex flex-col gap-3">
                <Input
                    name="elementCode"
                    label="Element Code"
                    value={elementForm?.code || ""}
                    onChange={e => setElementForm({ ...elementForm, code: e.target.value })}
                    required
                    fullWidth
                    disabled={editMode}
                />
                <Input
                    name="elementDescription"
                    label="Description"
                    value={elementForm?.description || ""}
                    onChange={e => setElementForm({ ...elementForm, description: e.target.value })}
                    fullWidth
                />
                <Checkbox
                    checked={elementForm?.active ?? true}
                    onChange={checked => setElementForm({ ...elementForm, active: checked })}
                    label="Active"
                />
                {/* Dynamic columns */}
                {dictionary.columns.map(col => (
                    <TypedInput
                        valueType={col.type}
                        key={col.code}
                        name={col.code}
                        label={`${col.code} (${col.type})${col.translatable ? ' [translatable]' : ''}`}
                        value={elementForm?.values?.[col.code] || ""}
                        onChange={e => onElementChange(col.code, e.target.value)}
                        onDateChange={date => onElementChangeDate(col.code, date)}
                        required={col.required}
                        fullWidth
                    ></TypedInput>
                ))}
            </div>
            <div className="flex gap-2 justify-center mt-2">
                <Button
                    onClick={onAddElement}
                    mode={BtnModes.PRIMARY}
                    disabled={!elementForm?.code || !allElementRequiredFiledsFilled}
                >
                    {editMode ? `Update Element` : `Add Element`}
                </Button>
                <Button
                    onClick={() => onCancel()}
                    mode={BtnModes.PRIMARY_TXT}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default DictionaryElementForm;
