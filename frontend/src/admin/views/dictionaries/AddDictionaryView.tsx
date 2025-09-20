import { DictionaryColumnType, DictionaryColumnTypes, DictionaryI, DictionaryStatuses } from "@shared/DictionaryI";
import Buton from "global/components/controls/Buton";
import Dropdown from "global/components/controls/Dropdown";
import Input from "global/components/controls/Input";
import { BtnModes, BtnSizes, DropdownItem } from "global/interface/controls.interface";
import React, { useState } from "react";
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from "global/components/controls/Checkbox";

interface ColumnForm {
  code: string;
  type: DropdownItem | null;
  required: boolean;
  description?: string;
}

const AddDictionaryView: React.FC = () => {

  const columnTypeOptions: DropdownItem[] = Object.values(DictionaryColumnTypes).map(type => ({ label: type, value: type }));

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<ColumnForm[]>([]);
  const [columnForm, setColumnForm] = useState<ColumnForm>({ code: "", type: columnTypeOptions[0], description: '', required: false });

  const handleAddColumn = () => {
    if (!columnForm.code) return;
    if (columns.some(col => col.code === columnForm.code)) {
      toast.error("Column code must be unique.");
      return;
    }
    setColumns([...columns, columnForm]);
    setColumnForm({ code: "", type: columnTypeOptions[0], required: false });
  };

  const handleRemoveColumn = (idx: number) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dictionary: DictionaryI = {
      code,
      description,
      version: 0,
      status: DictionaryStatuses.INACTIVE,
      columns: columns.map(col => ({
        code: col.code,
        type: col.type?.value as DictionaryColumnType,
        description: col.description,
        required: col.required
      })),
      elements: [],
      groups: []
    };

    console.log('Submitting dictionary: ', dictionary);
  }

  return (
    <form className="flex flex-col gap-4 p-4 border rounded shadow mt-20 min-w-[500px]" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold">Add Dictionary</h2>
      <div className="flex flex-col gap-3">

        <Input
          name="code"
          label="Code"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
          fullWidth
        />

        <Input
          name="description"
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          fullWidth
        />

        {columns.length > 0 && (
          <div className="flex flex-col gap-2 border-t pt-3 mt-3">
            <h3 className="font-semibold">Columns:</h3>
            <ul className="list-disc pl-5">
              {columns.map((col, idx) => (
                <li key={idx}>
                  {col.code} <span className="secondary-text">({col.type?.label})</span>
                </li>
              ))}
            </ul>
          </div>
        )}


        <div className="flex flex-col gap-3 border-y py-3 mt-3 ">

          <Dropdown
            type="single"
            items={columnTypeOptions}
            value={columnForm.type}
            fullWidth
            label="Column Type"
            required
            onSingleSelect={item => {
              setColumnForm({ ...columnForm, type: item });
            }}
          />

          <Input
            name="columnCode"
            label="Column Code"
            value={columnForm.code}
            onChange={e => setColumnForm({ ...columnForm, code: e.target.value })}
            required
            fullWidth
          />

          <Input
            name="columnDescription"
            label="Column description"
            value={columnForm.description}
            onChange={e => setColumnForm({ ...columnForm, description: e.target.value })}
            fullWidth
          />

          <Checkbox
            checked={columnForm.required}
            onChange={checked => setColumnForm({ ...columnForm, required: checked })}
            label="Required"
          />

          <Buton
            mode={BtnModes.PRIMARY_TXT}
            onClick={handleAddColumn}
            size={BtnSizes.SMALL}
            disabled={!columnForm.code || !columnForm.type}
          >
            <AddIcon />
            Add Column
          </Buton>

        </div>

      </div>

      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create Dictionary</button>
    </form>
  );
};

export default AddDictionaryView;
