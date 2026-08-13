import TileSection from "employee/components/TileSection";
import { Path } from "../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { useFriendsContext } from "friends/FriendsProvider";
import { useUsersStorage } from "global/providers/UsersStorageProvider";
import FriendListItem from "friends/components/FriendListItem";
import { useEffect, useState } from "react";
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI";
import { UserI } from "@shared/interfaces/UserI";

const DASHBOARD_FRIENDS_LIMIT = 3;

const FriendsDashboard: React.FC = () => {

    const userCtx = useUserContext();
    const friendsCtx = useFriendsContext();
    const usersStorage = useUsersStorage();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const uid = userCtx.me?.uid;

    const [friends, setFriends] = useState<{ user: UserI, friendship: FriendshipI }[]>([]);

    useEffect(() => {
        initFriends();
    }, [friendsCtx.friendships, uid]);

    const initFriends = async () => {
        if (!uid) return;

        const accepted = friendsCtx.friendships
            .filter(f => f.status === FriendshipStatuses.ACCEPTED)
            .slice(0, DASHBOARD_FRIENDS_LIMIT);

        if (!accepted.length) {
            setFriends([]);
            return;
        }

        const friendUids = accepted.map(f => f.requesterUid === uid ? f.addresseeUid : f.requesterUid);
        const users = await usersStorage.getUsers(friendUids);

        const result = accepted
            .map(friendship => {
                const friendUid = friendship.requesterUid === uid ? friendship.addresseeUid : friendship.requesterUid;
                const user = users.find(u => u.uid === friendUid);
                return user ? { user, friendship } : null;
            })
            .filter((f): f is { user: UserI, friendship: FriendshipI } => !!f);

        setFriends(result);
    };

    if (!uid) {
        return null;
    }

    return <TileSection title={t("account.friends")}
        link={{ onClick: () => navigate(Path.getFriendsPath(uid)) }}>

        {friends.map(({ user, friendship }) => (
            <div key={user.uid}>
                <FriendListItem user={user} friendship={friendship}/>
            </div>
        ))}

    </TileSection>
}

export default FriendsDashboard;