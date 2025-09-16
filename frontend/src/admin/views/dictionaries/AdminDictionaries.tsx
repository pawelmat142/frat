import { DictionaryI } from "@shared/DictionaryI";
import Buton from "../../../global/components/controls/Buton";

const AdminDictionaries: React.FC = () => {

    const onAddDictionary = () => {
        const dictionary: DictionaryI = {
            code: 'test',
            description: 'test',
            version: 1,
            columns:[],
            elements:[],
            groups:[],
            status: 'ACTIVE'
        }
        console.log(dictionary);
    }

    return (<div className="flex flex-1 flex-col gap-2 justify-center items-center">

        <Buton onClick={onAddDictionary}>Add dictionary</Buton>

    </div>)
}

export default AdminDictionaries;