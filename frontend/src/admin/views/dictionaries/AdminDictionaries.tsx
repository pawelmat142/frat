import Buton from "../../../global/components/controls/Buton";

const AdminDictionaries: React.FC = () => {

    const onAddDictionary = () => {
        console.log('add dictionary');
    }

    return (<div className="flex flex-1 flex-col gap-2 justify-center items-center">

        <Buton onClick={onAddDictionary}>Add dictionary</Buton>

    </div>)
}

export default AdminDictionaries;