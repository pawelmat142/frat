import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DictionaryI, DictionaryElement } from "@shared/DictionaryI";
import Buton from "global/components/controls/Buton";
import DictionaryElementForm from "./DictionaryElementForm";
import { httpClient } from "global/services/http";
import Loading from "global/components/Loading";
import AddIcon from '@mui/icons-material/Add';
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom"; 
import { Path } from "../../../path";

// TODO ustandaryzować wersje tekstu 


const DictionaryView: React.FC = () => {
    const navigate = useNavigate();
    const { code = "" } = useParams<{ code: string }>();
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
    const [loading, setLoading] = useState(false);
    const [elementForm, setElementForm] = useState<Partial<DictionaryElement> | null>(null);
    const [elements, setElements] = useState<DictionaryElement[]>([]);

    useEffect(() => {
        if (!code) return;
        setLoading(true);
        httpClient.get<DictionaryI>(`/dictionaries/${code}`)
            .then(dict => {
                setDictionary(dict);
                setElements(dict.elements || []);
            })
            .finally(() => setLoading(false));
    }, [code]);

    if (loading) {
        return <Loading />;
    }

    if (!dictionary) {
        return <div className="p-5 text-center primary-text">Dictionary not found.</div>;
    }

    const handleAddElement = () => {
        if (elements.some(e => e.code === elementForm?.code)) {
            // TODO: toast error
            return;
        }
        // Prepare values for columns
        const values: { [key: string]: any } = {};
        dictionary.columns.forEach(col => {
            values[col.code] = elementForm?.values?.[col.code] ?? "";
        });
        if (!elementForm) return;
        const newElement: DictionaryElement = {
            code: elementForm.code ?? "",
            description: elementForm.description || "",
            active: elementForm.active ?? true,
            values,
        };
        setElements([...elements, newElement]);
        setElementForm(null);
    };

    // TODO dodawanie grup


    // Check if all required fields for the element are filled
    const allElementRequiredFieldsFilled = dictionary.columns.every(col => {
        if (col.required) {
            return elementForm?.values?.[col.code] !== undefined && elementForm?.values?.[col.code] !== "";
        }
        return true;
    });

    return (
        <div className="flex flex-col gap-6 items-center w-full px-5 py-3">
            <div className="w-full max-w-6xl">
                <Buton onClick={() => navigate(Path.ADMIN_DICTIONARIES)} mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} className="ripple">
                    ← Back
                </Buton>
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold primary-text">code: {dictionary.code}</h2>
                    <h2 className="primary-text">version: {dictionary.version}</h2>
                    <h2 className="primary-text">status: <span className="primary-color">{dictionary.status}</span> </h2>
                </div>
                {dictionary.description && (
                    <div className="mb-4 secondary-text">Description: {dictionary.description}</div>
                )}
                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Code</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Description</th>
                                {dictionary.columns.map(col => (
                                    <th key={col.code} className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">{col.code}</th>
                                ))}
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {elements.length === 0 ? (
                                <tr>
                                    <td colSpan={3 + dictionary.columns.length + 1} className="px-6 py-6 secondary-text text-center">No elements found.</td>
                                </tr>
                            ) : (
                                elements.map((el, idx) => (
                                    <tr key={el.code} className={idx === 0 ? "primary-bg font-bold transition" : "hover:active-bg transition"}>
                                        <td className={"px-6 py-3 border-b border-color font-mono text-base primary-text" + (idx === 0 ? " font-bold" : "")}>{el.code}</td>
                                        <td className={"px-6 py-3 border-b border-color secondary-text" + (idx === 0 ? " font-bold" : "")}>{el.description}</td>
                                        {dictionary.columns.map(col => (
                                            <td key={col.code} className="px-6 py-3 border-b border-color primary-text">{el.values[col.code] !== undefined && el.values[col.code] !== "" ? el.values[col.code] : "-"}</td>
                                        ))}
                                        <td className={"px-6 py-3 border-b border-color" + (idx === 0 ? " font-bold" : "")}>{el.active ? <span className="primary-color font-semibold">Yes</span> : <span className="secondary-text">No</span>}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Add element button and form */}
                <div className="flex flex-col items-center mb-10 mt-5">
                    {!elementForm ? (
                        <Buton
                            onClick={() => setElementForm({})}
                            className="mx-auto"
                            mode={BtnModes.PRIMARY}
                            size={BtnSizes.LARGE}
                        >
                            <AddIcon /> Add Element
                        </Buton>
                    ) : (
                        <div className="flex flex-col gap-4 mt-4 secondary-bg w-full max-w-lg mx-auto">
                            <div className="flex flex-col gap-3">
                                <DictionaryElementForm
                                    dictionary={dictionary}
                                    elementForm={elementForm}
                                    setElementForm={setElementForm}
                                    onAddElement={handleAddElement}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DictionaryView;
