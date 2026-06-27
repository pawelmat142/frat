import TileSection from "employee/components/TileSection";
import FriendshipListItem from "friends/components/FriendshipListItem";
import { Path } from "../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";

const FriendsDashboard: React.FC = () => {

    const userCtx = useUserContext();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const friends = userCtx.meCtx?.friendsDashboard || []

    const uid = userCtx.me?.uid;

    if (!uid) {
        return null;
    }

    return <TileSection title={t("account.friends")} 
        link={{ onClick: () => navigate(Path.getFriendsPath(uid)) }}>

        {friends.map(user => {
            const friendship = userCtx.meCtx?.friendships?.find(f => f.requesterUid === user.uid || f.addresseeUid === user.uid);
            
            if (!friendship) {
                return null;
            }
            
            return <div key={user.uid}>
                <FriendshipListItem user={user} friendship={friendship} /> 
            </div>
        })}

    </TileSection>
}

export default FriendsDashboard;