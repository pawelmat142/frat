import Buton from "../../../global/components/controls/Buton";
import { useNavigate } from "react-router-dom";
import { Path } from "../../../path"
import { httpClient } from "global/services/http";
import ImportDictionaryButton from "../../../global/components/controls/SelectFileButton";
import { useEffect, useState } from "react";
import { DictionaryListItem } from "@shared/DictionaryI";
import { Util } from "@shared/utils/util";
import AddIcon from '@mui/icons-material/Add';
import { toast } from "react-toastify";
import Loading from "global/components/Loading";

const AdminDictionaries: React.FC = () => {
    const navigate = useNavigate();
    const [dictionaries, setDictionaries] = useState<DictionaryListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const loadDictionaries = () => {
        setLoading(true);
        httpClient.get<DictionaryListItem[]>("/dictionaries/list")
            .then(setDictionaries)
            .catch(() => setDictionaries([]))
            .finally(() => setLoading(false));
    }
    
    useEffect(() => {
        loadDictionaries();
    }, []);

    const onAddDictionary = () => {
        navigate(Path.ADMIN_DICTIONARIES_ADD);
    };

    const handleRowClick = (code: string) => {
        navigate(Path.getDictionaryPath(code));
    };

    const handleImportDictionary = async (file: File) => {
        try {
            setLoading(true);
            const text = await file.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                toast.error("Invalid JSON file.");
                return;
            }
            await httpClient.post("/dictionaries/import", data);

            toast.success("Dictionary imported successfully.");
            loadDictionaries();
        } catch (err: any) {
            // toast.error("Import failed: " + (err?.message || "Unknown error"));
        } finally {
            setLoading(false);
        }       
    }

    if (loading) {
        return <Loading></Loading>
    }

    return (
        <div className="flex flex-1 flex-col gap-2 items-center w-full p-5">
            <div className="w-full px-0">
                <h2 className="h2 mb-6 pl-2 primary-text">Dictionaries list:</h2>
                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead className="">
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Code</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Version</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Status</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dictionaries.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-6 secondary-text text-center">No dictionaries found.</td>
                                </tr>
                            ) : (
                                dictionaries.map((dict, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover:active-bg transition cursor-pointer"
                                        onClick={() => handleRowClick(dict.code)}
                                        style={{ userSelect: 'none' }}
                                    >
                                        <td className={"px-6 py-3 border-b border-color font-mono text-base primary-text"}>{dict.code}</td>
                                        <td className={"px-6 py-3 border-b border-color primary-text"}>{dict.version}</td>
                                        <td className={"px-6 py-3 border-b border-color"}>{dict.status}</td>
                                        <td className={"px-6 py-3 border-b border-color primary-text"}>
                                            {Util.displayDate(dict.updatedAt) || Util.displayDate(dict.createdAt) || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Buton onClick={onAddDictionary}>
                    <AddIcon />
                    Add dictionary
                </Buton>
                <ImportDictionaryButton onFileSelected={handleImportDictionary} label="Import dictionary" />
            </div>
        </div>
    );
}

export default AdminDictionaries;