import { DictionaryColumnType, DictionaryColumnTypes, DictionaryElement, DictionaryI, DictionaryStatuses } from "@shared/DictionaryI";
import Buton from "global/components/controls/Buton";
import Dropdown from "global/components/controls/Dropdown";
import Input from "global/components/controls/Input";
import { BtnModes, BtnSizes, DropdownItem } from "global/interface/controls.interface";
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from "global/components/controls/Checkbox";
import { httpClient } from "global/services/http";
import { useNavigate, useParams } from "react-router-dom";
import { Path } from '../../../path';
import Loading from "global/components/Loading";
import TypedInput from "global/components/controls/TypedInput";
import IconButton from "global/components/controls/IconButon";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DictionaryAdminService } from "admin/services/DictionaryAdmin.service";
import { useConfirm } from "global/providers/PopupProvider";
import { DictionaryValidators } from "@shared/utils/DictionaryValidators";

interface ColumnForm {
  code: string;
  type: DropdownItem | null;
  required: boolean;
  description?: string;
  defaultValue?: any;
  editMode?: boolean;
}

const AddDictionaryView: React.FC = () => {

  const columnTypeOptions: DropdownItem[] = Object.values(DictionaryColumnTypes).map(type => ({ label: type, value: type }));

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<ColumnForm[]>([]);
  const [columnForm, setColumnForm] = useState<ColumnForm | null>(null);
  const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

  const { code: editCode } = useParams<{ code?: string }>();
  const isEditMode = window.location.pathname.includes("/edit/") && !!editCode;

  const confirm = useConfirm()

  useEffect(() => {
    if (isEditMode && editCode) {
      setLoading(true);
      DictionaryAdminService.getDictionary(editCode)
        .then(dict => {
          setDictionary(dict);
          setCode(dict.code);
          setDescription(dict.description || "");
          setColumns(dict.columns.map(col => ({
            code: col.code,
            type: { label: col.type, value: col.type },
            required: col.required,
            description: col.description,
            defaultValue: col.defaultValue
          })));
        })
        .catch(err => {
          toast.error("Error loading dictionary for edit");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, editCode]);

  const navigate = useNavigate()

  const handleAddColumn = () => {
    if (!columnForm?.code) {
      setColumnForm({ code: "", type: columnTypeOptions[0], description: "", required: false });
      return
    };
    if (!isEditMode && columns.some(col => col.code === columnForm.code)) {
      toast.error("Column code must be unique.");
      return;
    }

    const codeError = DictionaryValidators.validateCode(columnForm.code);
    if (codeError) {
      toast.error(codeError);
      return
    }

    setColumns([...columns, columnForm]);
    setColumnForm(null);
  };

  const handleRemoveColumn = async (col: ColumnForm) => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete the column "${col.code}"? This action cannot be undone.`,
    })
    if (!confirmed) return;
    setColumns(columns.filter(c => c !== col));
  };

  const getElements = (): DictionaryElement[] => {
    if (!isEditMode) {
      return [];
    }
    return (dictionary?.elements || []).map(el => {
      // 1. Usuń wartości nieistniejących kolumn
      let filteredValues = Object.fromEntries(
        Object.entries(el.values || {}).filter(([key]) => columns.some(col => col.code === key))
      );
      // 2. Dodaj domyślne wartości dla wymaganych kolumn, jeśli nie istnieją
      columns.forEach(col => {
        if (col.required && filteredValues[col.code] === undefined) {
          filteredValues[col.code] = col.defaultValue;
        }
      });
      return { ...el, values: filteredValues };
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = DictionaryValidators.validateCode(code);
    if (error) {
      toast.error(error);
      return;
    }

    const result: DictionaryI = {
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
      elements: getElements(),
      groups: dictionary?.groups || []
    };

    try {
      setLoading(true);
      const res = await httpClient.put<DictionaryI>('/dictionaries', result)
      if (isEditMode) {
        toast.success(`Dictionary ${res.code} updated successfully!`)
      } else {
        toast.success(`Dictionary ${res.code} created successfully!`)
      }
      
      if (isEditMode) {
        navigate(Path.getDictionaryPath(res.code))
      } else {
        navigate(Path.ADMIN_DICTIONARIES)
      }

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

  const handleEditColumn = (col: ColumnForm) => {
    setColumnForm({ ...col, editMode: true });
  }

  // TODO
  // kontrolka number kolumny
  // kontrolka stringlist kolumny

  if (loading) {
    return <Loading></Loading>
  }

  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="w-full px-5 py-3">
      <Buton onClick={() => goBack()} mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} className="ripple mb-2">
        ← Back
      </Buton>
      <form className="flex flex-col gap-4 p-4 rounded mt-10 max-w-xl mx-auto mb-20" onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold">{isEditMode ? "Edit dictionary" : "Add Dictionary"}</h2>
        <div className="flex flex-col gap-3">

          <Input
            name="code"
            label="Code"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            fullWidth
            disabled={isEditMode}
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
              disabled={!!columnForm.editMode}
            />

            <Input
              name="columnDescription"
              label="Column description"
              value={columnForm.description || null}
              onChange={e => setColumnForm({ ...columnForm, description: e.target.value })}
              fullWidth
            />

            <Checkbox
              checked={columnForm.required}
              onChange={checked => setColumnForm({ ...columnForm, required: checked })}
              label="Required"
            />
            {columnForm.required && (
              <TypedInput
                valueType={columnForm.type?.value as DictionaryColumnType}
                name="defaultValue"
                label="Default value"
                value={columnForm.defaultValue ?? ""}
                onChange={e => setColumnForm({ ...columnForm, defaultValue: e.target.value })}
                onDateChange={date => {
                  setColumnForm({ ...columnForm, defaultValue: date })
                }
                }
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
                disabled={!columnForm?.code || !columnForm.type || (columnForm.required && !columnForm.defaultValue)}
              >
                Column ready
              </Buton>
              <Buton
                mode={BtnModes.ERROR_TXT}
                onClick={() => setColumnForm(null)}
                size={BtnSizes.SMALL}
              >
                {/* if edit mode show cancel editing */}
                {columnForm.editMode ? "Cancel editing" : "Cancel column"}
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
              <h3 className="font-semibold mt-5">Columns:</h3>
              <ul className="list-disc pl-5">
                {columns.map((col, idx) => (
                  <li key={idx} className="mt-3">
                    <div className="flex justify-between align-center">
                      <div>
                        {col.required && <span className="text-error">*</span>}
                        <span>{col.code}</span>
                        <span> </span>
                        <span className="secondary-text">({col.type?.label})</span>
                        {(col.description) && <span> - {col.description}</span>}
                      </div>

                      <div className="flex gap-2">
                        <IconButton icon={<EditIcon />} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY} onClick={() => handleEditColumn(col)} />
                        <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR} onClick={() => handleRemoveColumn(col)} />
                      </div>

                    </div>
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
          disabled={!code || !description || columns.length === 0 || !!columnForm}
        >
          {isEditMode ? "Update dictionary" : "Create dictionary"}
        </Buton>
      </form>

    </div>
  );
};

export default AddDictionaryView;
