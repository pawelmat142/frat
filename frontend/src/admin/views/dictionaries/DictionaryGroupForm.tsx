import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DictionaryAdminService } from "admin/services/DictionaryAdmin.service";
import Input from "global/components/controls/Input";
import Buton from "global/components/controls/Buton";
import Checkbox from "global/components/controls/Checkbox";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { Path } from "../../../path";
import Loading from "global/components/Loading";
import { toast } from "react-toastify";
import { DictionaryI } from "@shared/interfaces/DictionaryI";

const DictionaryGroupForm: React.FC = () => {
    const pathInput = useParams<{ groupCode: string, dictionaryCode: string }>();

    const dictionaryCode = pathInput.dictionaryCode || '';
    const editMode = pathInput.groupCode !== 'new';

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
    const [groupCode, setGroupCode] = useState(editMode ? (pathInput.groupCode || '') : '');
    const [groupDescription, setGroupDescription] = useState("");
    const [selectedElements, setSelectedElements] = useState<string[]>([]);
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (!dictionaryCode) return;
        setLoading(true);
        DictionaryAdminService.getDictionary(dictionaryCode)
            .then(dict => {
                setDictionary(dict);
                if (editMode && dict.groups) {
                    const group = dict.groups.find(g => g.code === pathInput.groupCode);
                    if (group) {
                        setGroupDescription(group.description || '');
                        setSelectedElements(group.elementCodes || []);
                        setActive(group.active !== false);
                    }
                }
            })
            .catch(() => setDictionary(null))
            .finally(() => setLoading(false));
    }, [dictionaryCode, editMode, pathInput.groupCode]);

    if (loading || !dictionary) {
        return <Loading />;
    }

    const handleElementToggle = (elementCode: string) => {
        setSelectedElements(prev =>
            prev.includes(elementCode)
                ? prev.filter(code => code !== elementCode)
                : [...prev, elementCode]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Check if group code already exists (only when adding, not editing)
        if (!editMode && dictionary.groups && dictionary.groups.some(g => g.code === groupCode)) {
            toast.error("Group with this code already exists in the dictionary.");
            return;
        }

        const updatedDictionary = getDictionaryToSave();
        setLoading(true);
        try {
            await DictionaryAdminService.putDictionary(updatedDictionary);
            navigate(Path.getDictionaryPath(dictionary.code));
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const getDictionaryToSave = (): DictionaryI => {
        if (editMode) {
            const groups = dictionary.groups.map(group => {
                if (group.code === groupCode) {
                    group.description = groupDescription;
                    group.elementCodes = selectedElements;
                    group.active = active;
                }
                return group;
            });
            return {
                ...dictionary,
                groups
            };
        }
        const newGroup = {
            code: groupCode,
            elementCodes: selectedElements,
            active
        }
        return {
            ...dictionary,
            groups: [...(dictionary.groups || []), newGroup],
        };
    }

    return (
        <div className="w-full px-5 py-3">
            <Buton onClick={() => navigate(Path.getDictionaryPath(dictionary.code))} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT} className="ripple mb-2">
                ← Back
            </Buton>
            <form className="flex flex-col gap-4 p-4 rounded mt-10 max-w-xl mx-auto mb-20" onSubmit={handleSubmit}>
                <h2 className="text-lg font-bold mb-4">
                    {editMode ? `Edit group ${groupCode} in Dictionary: ${dictionary.code}` : `Add Group to Dictionary: ${dictionary.code}`}
                </h2>
                <Input
                    name="groupCode"
                    label="Group Code"
                    value={groupCode}
                    onChange={e => setGroupCode(e.target.value)}
                    required
                    fullWidth
                    disabled={editMode}
                />
                <Input
                    name="groupDescription"
                    label="Group Description"
                    value={groupDescription}
                    onChange={e => setGroupDescription(e.target.value)}
                    fullWidth
                />
                <Checkbox
                    checked={active}
                    onChange={setActive}
                    label="Active"
                />
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold mt-5">Select Elements:</h3>
                    {dictionary.elements.length === 0 ? (
                        <div className="secondary-text">No elements available.</div>
                    ) : (
                        dictionary.elements.map(el => (
                            <Checkbox
                                key={el.code}
                                checked={selectedElements.includes(el.code)}
                                onChange={() => handleElementToggle(el.code)}
                                label={el.code}
                            />
                        ))
                    )}
                </div>
                <Buton
                    mode={BtnModes.PRIMARY}
                    type="submit"
                    disabled={!groupCode || selectedElements.length === 0}
                    className="mt-4"
                >
                    {editMode ? 'Save group' : 'Add Group'}
                </Buton>
            </form>
        </div>
    );
};

export default DictionaryGroupForm;
