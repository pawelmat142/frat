import { useAuthContext } from "auth/AuthProvider"
import Button from "global/components/controls/Button"
import { BtnModes } from "global/interface/controls.interface"
import { Path } from "../../path"
import { FaIdCard } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useUserContext } from "user/UserProvider"
import { useEffect, useState } from "react"
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI"
import { UserI } from "@shared/interfaces/UserI"
import { UserPublicService } from "user/services/UserPublicService"
import FriendshipListItem from "friends/components/FriendshipListItem"

const FriendsListView: React.FC = () => {
    const { me } = useAuthContext()

    const navigate = useNavigate()
    const { t } = useTranslation()
    const userCtx = useUserContext();

    const [friends, setFriends] = useState<{ user: UserI, friendship: FriendshipI }[]>([]);

    useEffect(() => {
        initFriends();
    }, [userCtx.friendships]);

    const initFriends = async () => {
        const uids = Array.from(new Set(userCtx.friendships.flatMap(f => [f.requesterUid, f.addresseeUid])))
            .filter(id => id !== me?.uid);

        const users = await UserPublicService.fetchUsers(uids)

        const friends = userCtx.friendships.filter(f => f.status !== FriendshipStatuses.REJECTED).map(friendship => {
            const friendUid = friendship.requesterUid === me?.uid ? friendship.addresseeUid : friendship.requesterUid;
            const user = users.find(u => u.uid === friendUid)!;
            return { user, friendship }
        })
        
        // Sort: received invitations first, friends in middle, sent invitations last
        friends.sort((a, b) => {
            const isAReceived = a.friendship.status === FriendshipStatuses.PENDING && a.friendship.addresseeUid === me?.uid;
            const isBReceived = b.friendship.status === FriendshipStatuses.PENDING && b.friendship.addresseeUid === me?.uid;
            const isAAccepted = a.friendship.status === FriendshipStatuses.ACCEPTED;
            const isBAccepted = b.friendship.status === FriendshipStatuses.ACCEPTED;
            
            if (isAReceived && !isBReceived) return -1;
            if (!isAReceived && isBReceived) return 1;
            if (isAAccepted && !isBAccepted && !isBReceived) return -1;
            if (!isAAccepted && isBAccepted && !isAReceived) return 1;
            
            return 0;
        });
        
        setFriends(friends);
    }

    // TODO this view should be not permitted if not my account or not friend

    // TODO szukanie przerobic na floating button albo do headera

    return (
        <div className="list-view">
            
            <div className="px-2 flex flex-col gap-1 mt-2">

                {!friends.length && (
                    <div className="flex flex-col items-center gap-3 mt-10">
                        <FaIdCard size={48} className="secondary-text" />
                        <div className="secondary-text">{t('friends.noFriends')}</div>
                    </div>
                )}

                {friends.map(({ user, friendship }) => (
                    <div className="list-view-item" key={user.uid}>
                        <FriendshipListItem
                            user={user}
                            friendship={friendship}
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 mt-6 px-5">

                <Button
                    fullWidth
                    mode={BtnModes.SECONDARY}
                    onClick={() => navigate(Path.FRIENDS_SEARCH)}
                >
                    <FaIdCard className="mr-2" />
                    {t('friends.search')}
                </Button>

            </div>
        </div>
    )
}

export default FriendsListView;