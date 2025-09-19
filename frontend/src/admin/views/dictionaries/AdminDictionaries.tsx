import Buton from "../../../global/components/controls/Buton";
import { useNavigate } from "react-router-dom";
import { Path } from "../../../path"

const AdminDictionaries: React.FC = () => {

    const navigate = useNavigate()
    const onAddDictionary = () => {
        navigate(Path.ADMIN_DICTIONARIES_ADD)
    }

    return (<div className="flex flex-1 flex-col gap-2 justify-center items-center">

        <Buton onClick={onAddDictionary}>Add dictionary</Buton>

    </div>)
}

export default AdminDictionaries;