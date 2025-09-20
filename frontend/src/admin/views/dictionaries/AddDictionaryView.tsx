import { DictionaryColumnType, DictionaryColumnTypes, DictionaryI, DictionaryStatuses } from "@shared/DictionaryI";
import Buton from "global/components/controls/Buton";
import Dropdown from "global/components/controls/Dropdown";
import Input from "global/components/controls/Input";
import { BtnModes, BtnSizes, DropdownItem } from "global/interface/controls.interface";
import React, { useState } from "react";
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from "global/components/controls/Checkbox";
import { httpClient } from "global/services/http";
import { useNavigate } from "react-router-dom";
import { Path } from '../../../path';
import Loading from "global/components/Loading";

interface ColumnForm {
  code: string;
  type: DropdownItem | null;
  required: boolean;
  description?: string;
  defaultValue?: any;
}

const AddDictionaryView: React.FC = () => {

  const columnTypeOptions: DropdownItem[] = Object.values(DictionaryColumnTypes).map(type => ({ label: type, value: type }));

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<ColumnForm[]>([]);
  const [columnForm, setColumnForm] = useState<ColumnForm | null>(null);

  const navigate = useNavigate()

  const handleAddColumn = () => {
    if (!columnForm?.code) {
      setColumnForm({ code: "", type: columnTypeOptions[0], description: "", required: false });
      return
    };
    if (columns.some(col => col.code === columnForm.code)) {
      toast.error("Column code must be unique.");
      return;
    }
    setColumns([...columns, columnForm]);
    setColumnForm(null);
  };

  const handleRemoveColumn = (idx: number) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        required: col.required,
        defaultValue: col.required ? col.defaultValue : undefined,
      })),
      elements: [],
      groups: []
    };

    try {
      setLoading(true);
      const res = await httpClient.put<DictionaryI>('/dictionaries', dictionary);
      toast.success(`Dictionary ${res.code} created successfully!`);
      navigate(Path.ADMIN_DICTIONARIES)

    } catch (error) {
      // TODO error handling
      console.error('Error updating dictionary: ', error);
    }
    finally {
      resetForm();
      setLoading(false);
    }
  }

  const resetForm = () => {
    setCode("");
    setDescription("");
    setColumns([]);
    setColumnForm(null);
  }

  if (loading) {
    return <Loading></Loading>
  }

  const allRowRequiredFiledsFilled = columns.every(col => !col.required || (columns));

  return (
    <div className="w-full px-5 py-3">
      <Buton onClick={() => navigate(Path.ADMIN_DICTIONARIES)} mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} className="ripple mb-2">
        ← Back
      </Buton>
      <form className="flex flex-col gap-4 p-4 border rounded shadow mt-10 max-w-xl mx-auto mb-20" onSubmit={handleSubmit}>
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

          {columnForm && (<div className="flex flex-col gap-3 border-t pt-3 mt-3">

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
            {columnForm.required && (
              <Input
                name="defaultValue"
                label="Default value"
                value={columnForm.defaultValue ?? ""}
                onChange={e => setColumnForm({ ...columnForm, defaultValue: e.target.value })}
                required
                fullWidth
              />
            )}

          </div>)}

          {columnForm ? (
            <div className="flex gap-2">
              <Buton
                onClick={handleAddColumn}
                size={BtnSizes.SMALL}
                disabled={!columnForm?.code || !columnForm.type}
              >
                Column ready
              </Buton>
              <Buton
                mode={BtnModes.PRIMARY_TXT}
                onClick={() => setColumnForm(null)}
                size={BtnSizes.SMALL}
              >
                Cancel column
              </Buton>

            </div>

          ) : (
            <Buton
              mode={BtnModes.PRIMARY_TXT}
              onClick={handleAddColumn}
              size={BtnSizes.SMALL}
            >
              <AddIcon />
              Add Column
            </Buton>
          )}

          {columns.length > 0 && (
            <div className="flex flex-col gap-2 border-t pt-3">
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

        </div>

        <Buton
          mode={BtnModes.PRIMARY}
          size={BtnSizes.LARGE}
          fullWidth={true}
          className="mt-5"
          type="submit"
          disabled={!code || !description || columns.length === 0}
        >
          Create dictionary
        </Buton>
      </form>

    </div>
  );
};

export default AddDictionaryView;
