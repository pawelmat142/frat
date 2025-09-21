import React from "react";
import Input from "global/components/controls/Input";
import Checkbox from "global/components/controls/Checkbox";
import Buton from "global/components/controls/Buton";
import AddIcon from '@mui/icons-material/Add';
import { BtnModes } from "global/interface/controls.interface";
import { DictionaryI, DictionaryElement } from "@shared/DictionaryI";

interface DictionaryElementFormProps {
    dictionary: DictionaryI;
    elementForm: Partial<DictionaryElement> | null;
    setElementForm: (form: Partial<DictionaryElement> | null) => void;
    onAddElement: () => void;
}

const DictionaryElementForm: React.FC<DictionaryElementFormProps> = ({
    dictionary,
    elementForm,
    setElementForm,
    onAddElement
}) => {
    const allElementRequiredFiledsFilled = dictionary.columns.every(col => !col.required || (elementForm?.values && elementForm.values[col.code]));

    return (
        <div className="flex flex-col gap-4 p-4 border rounded shadow w-full max-w-lg mx-auto">
            <h3 className="text-lg font-bold mb-2">Add Element</h3>
            <div className="flex flex-col gap-3">
                <Input
                    name="elementCode"
                    label="Element Code"
                    value={elementForm?.code || ""}
                    onChange={e => setElementForm({ ...elementForm, code: e.target.value })}
                    required
                    fullWidth
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
                    <Input
                        key={col.code}
                        name={col.code}
                        label={col.code + " (" + col.type + ")"}
                        value={elementForm?.values?.[col.code] || ""}
                        onChange={e => setElementForm({
                            ...elementForm,
                            values: {
                                ...elementForm?.values,
                                [col.code]: e.target.value
                            }
                        })}
                        required={col.required}
                        fullWidth
                    />
                ))}
            </div>
            <div className="flex gap-2 justify-center mt-2">
                <Buton
                    onClick={onAddElement}
                    mode={BtnModes.PRIMARY}
                    disabled={!elementForm?.code || !allElementRequiredFiledsFilled}
                >
                    <AddIcon /> Add Element
                </Buton>
                <Buton
                    onClick={() => setElementForm(null)}
                    mode={BtnModes.PRIMARY_TXT}
                >
                    Cancel
                </Buton>
            </div>
        </div>
    );
};

export default DictionaryElementForm;
