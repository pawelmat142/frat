import { useAuthContext } from "auth/AuthProvider";
import { useUserContext } from "user/UserProvider";

const OfferView: React.FC = () => {

    const { me } = useAuthContext();
    const userCtx = useUserContext();


    return (
        null
    )
}

export default OfferView;