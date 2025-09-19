import { DictionaryColumnType, DictionaryColumnTypes } from "@shared/DictionaryI";
import Dropdown from "global/components/controls/Dropdown";
import Input from "global/components/controls/Input";
import { DropdownItem } from "global/interface/controls.interface";
import React, { useState } from "react";

interface ColumnForm {
  name: string;
  type: DropdownItem | null;
  required: boolean;
}

const AddDictionaryView: React.FC = () => {

  const columnTypeOptions: DropdownItem[] = Object.values(DictionaryColumnTypes).map(type => ({ label: type, value: type }));

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<ColumnForm[]>([]);
  const [columnForm, setColumnForm] = useState<ColumnForm>({ name: "", type: columnTypeOptions[0], required: false });

  const handleAddColumn = () => {
    if (!columnForm.name) return;
    setColumns([...columns, columnForm]);
    setColumnForm({ name: "", type: columnTypeOptions[0], required: false });
  };

  const handleRemoveColumn = (idx: number) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Tu można dodać logikę wysyłki danych do API
    console.log({ code, description, columns });
  };



  return (
    <form className="flex flex-col gap-4 p-4 border rounded shadow mt-20" onSubmit={handleSubmit}>
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

      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Columns</h3>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Column name"
            value={columnForm.name}
            onChange={e => setColumnForm({ ...columnForm, name: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={columnForm.required}
              onChange={e => setColumnForm({ ...columnForm, required: e.target.checked })}
            />
            Required
          </label>
          <button type="button" onClick={handleAddColumn} className="px-2 py-1 bg-blue-500 text-white rounded">Add</button>
        </div>
        <ul className="list-disc pl-5">
        </ul>
      </div>
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Create Dictionary</button>
    </form>
  );
};

export default AddDictionaryView;
