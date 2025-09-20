import Buton from "../../../global/components/controls/Buton";
import { useNavigate } from "react-router-dom";
import { Path } from "../../../path"
import { httpClient } from "global/services/http";
import { useEffect, useState } from "react";
import { DictionaryListItem } from "@shared/DictionaryI";
import AddIcon from '@mui/icons-material/Add';

const AdminDictionaries: React.FC = () => {
    const navigate = useNavigate();
    const [dictionaries, setDictionaries] = useState<DictionaryListItem[]>([]);

    useEffect(() => {
        httpClient.get<DictionaryListItem[]>("/dictionaries/list")
            .then(setDictionaries)
            .catch(() => setDictionaries([]));
    }, []);

    const onAddDictionary = () => {
        navigate(Path.ADMIN_DICTIONARIES_ADD);
    };

    const handleRowClick = (code: string) => {
        navigate(Path.getDictionaryPath(code));
    };

    return (
        <div className="flex flex-1 flex-col gap-2 items-center w-full p-5">
            <div className="w-full px-0 max-w-6xl">
                <h2 className="text-xl font-bold mb-6 pl-2 primary-text">Dictionaries list:</h2>
                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead className="">
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold primary-text">Code</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold primary-text">Version</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold primary-text">Status</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold primary-text">Updated At</th>
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
                                        className={
                                            idx === 0
                                                ? "primary-bg font-bold transition cursor-pointer"
                                                : "hover:active-bg transition cursor-pointer"
                                        }
                                        onClick={() => handleRowClick(dict.code)}
                                        style={{ userSelect: 'none' }}
                                    >
                                        <td className={"px-6 py-3 border-b border-color font-mono text-base primary-text" + (idx === 0 ? " font-bold" : "")}>{dict.code}</td>
                                        <td className={"px-6 py-3 border-b border-color primary-text" + (idx === 0 ? " font-bold" : "")}>{dict.version}</td>
                                        <td className={"px-6 py-3 border-b border-color" + (idx === 0 ? " font-bold" : "")}>
                                            <span className={dict.status === 'ACTIVE' ? 'primary-color font-semibold' : 'secondary-text'}>{dict.status}</span>
                                        </td>
                                        <td className={"px-6 py-3 border-b border-color primary-text" + (idx === 0 ? " font-bold" : "")}>
                                            {dict.updatedAt
                                                ? new Date(dict.updatedAt).toLocaleString()
                                                : dict.createdAt
                                                    ? new Date(dict.createdAt).toLocaleString()
                                                    : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Buton onClick={onAddDictionary} className="mt-8">
                <AddIcon />
                Add dictionary
            </Buton>
        </div>
    );
}

export default AdminDictionaries;