import Buton from "../../../global/components/controls/Buton";
import { BtnModes } from "../../../global/interface/controls.interface";

const AdminDictionaries: React.FC = () => {

    return (<div className="flex flex-1 flex-col gap-2 justify-center items-center">

        <Buton>Elo</Buton>
        <Buton mode={BtnModes.SECONDARY}>Elo</Buton>
        <Buton mode={BtnModes.PRIMARY_TXT}>Elo</Buton>
        <Buton mode={BtnModes.SECONDARY_TXT}>Elo</Buton>
        <Buton mode={BtnModes.WARNING}>Elo</Buton>

    </div>)
}

export default AdminDictionaries;