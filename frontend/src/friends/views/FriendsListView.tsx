import Button from "global/components/controls/Button"
import { BtnModes } from "global/interface/controls.interface"
import { Path } from "../../path"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useUserContext } from "user/UserProvider"
import { useFriendsContext } from "friends/FriendsProvider"
import { useEffect, useState } from "react"
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI"
import { UserI } from "@shared/interfaces/UserI"
import FriendshipListItem from "friends/components/FriendshipListItem"
import { FriendsService } from "friends/services/FriendsService"
import Loading from "global/components/Loading"
import { Ico } from "global/icon.def"
import { FriendUtil } from "@shared/utils/FriendUtil"
import { useUsersStorage } from "global/providers/UsersStorageProvider"

const FriendsListView: React.FC = () => {

    const { uid } = useParams<{ uid?: string }>()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const userCtx = useUserContext()
    const usersStorage = useUsersStorage();
    const friendsCtx = useFriendsContext();
    const me = userCtx?.me;
    const isMyAccount = uid === me?.uid

    const [friendships, setFriendships] = useState<FriendshipI[]>([])
    const [friends, setFriends] = useState<{ user: UserI, friendship: FriendshipI }[]>([])
    const [loading, setLoading] = useState(false)

    const isMyFriend = FriendUtil.isFriend(friendsCtx.friendships, uid!)

    if (!isMyAccount && !isMyFriend) {
        return null
    }

    useEffect(() => {
        if (!uid) return
        initFriendships()
    }, [uid])

    useEffect(() => {
        if (isMyAccount) {
            setFriendships(friendsCtx.friendships)
        }
    }, [friendsCtx.friendships])

    useEffect(() => {
        initFriends()
    }, [friendships])

    const initFriendships = async () => {
        if (isMyAccount) {
            setFriendships(friendsCtx.friendships)
            return
        }
        try {
            setLoading(true)
            const result = await FriendsService.getFriendships(uid!)
            setFriendships(result)
        } finally {
            setLoading(false)
        }
    }

    const initFriends = async () => {
        const uids = Array.from(new Set(friendships.flatMap(f => [f.requesterUid, f.addresseeUid])))
            .filter(id => id !== uid)

        if (!uids.length) {
            setFriends([])
            return;
        }
        const users = await usersStorage.getUsers(uids)

        const friends = friendships.filter(f => f.status !== FriendshipStatuses.REJECTED).map(friendship => {
            const friendUid = friendship.requesterUid === uid ? friendship.addresseeUid : friendship.requesterUid
            const user = users.find(u => u.uid === friendUid)!
            return { user, friendship }
        })

        // Sort: received invitations first, friends in middle, sent invitations last
        friends.sort((a, b) => {
            const isAReceived = a.friendship.status === FriendshipStatuses.PENDING && a.friendship.addresseeUid === uid
            const isBReceived = b.friendship.status === FriendshipStatuses.PENDING && b.friendship.addresseeUid === uid
            const isAAccepted = a.friendship.status === FriendshipStatuses.ACCEPTED
            const isBAccepted = b.friendship.status === FriendshipStatuses.ACCEPTED

            if (isAReceived && !isBReceived) return -1
            if (!isAReceived && isBReceived) return 1
            if (isAAccepted && !isBAccepted && !isBReceived) return -1;
            if (!isAAccepted && isBAccepted && !isAReceived) return 1;

            return 0;
        });

        setFriends(friends);
    }

    // TODO szukanie przerobic na floating button albo do headera

    if (loading) {
        return <Loading></Loading>
    }
    return (
        <div className="list-view">

            <div className="flex flex-col gap-1 mt-2">

                {!friends.length && (
                    <div className="flex flex-col items-center gap-3 mt-10 px-5 text-center">
                        <Ico.FRIENDS className="mx-auto text-4xl mb-2 opacity-50" />
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
                    <Ico.SEARCH className="mr-2" />
                    {t('friends.search')}
                </Button>
            </div>
        </div>
    )
}

export default FriendsListView;