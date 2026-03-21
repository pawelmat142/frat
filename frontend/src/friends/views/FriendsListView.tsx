import { FloatingInputModes } from "global/interface/controls.interface"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useUserContext } from "user/UserProvider"
import { useFriendsContext } from "friends/FriendsProvider"
import { useCallback, useEffect, useRef, useState } from "react"
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI"
import { UserI } from "@shared/interfaces/UserI"
import FriendshipListItem from "friends/components/FriendshipListItem"
import { FriendsService } from "friends/services/FriendsService"
import Loading from "global/components/Loading"
import { Ico } from "global/icon.def"
import { FriendUtil } from "@shared/utils/FriendUtil"
import { useUsersStorage } from "global/providers/UsersStorageProvider"
import FloatingInput from "global/components/controls/FloatingInput"
import { useDebouncedValue } from "global/utils/useDebouncedValue"
import { Search, Close } from "@mui/icons-material"
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter"
import UserInvitationListItem from "user/components/UserInvitationListItem"

const FriendsListView: React.FC = () => {

    const { uid } = useParams<{ uid?: string }>()
    const { t } = useTranslation()
    const userCtx = useUserContext()
    const usersStorage = useUsersStorage();
    const friendsCtx = useFriendsContext();
    const me = userCtx?.me;
    const isMyAccount = uid === me?.uid

    const [friendships, setFriendships] = useState<FriendshipI[]>([])
    const [friends, setFriends] = useState<{ user: UserI, friendship: FriendshipI }[]>([])
    const [loading, setLoading] = useState(false)

    // Search state
    const INITIAL_LIMIT = 20;
    const LOAD_MORE_LIMIT = 10;
    const MIN_QUERY_LENGTH = 3;

    const [freeTextInput, setFreeTextInput] = useState('');
    const debouncedQuery = useDebouncedValue(freeTextInput, 500);
    const [searchUsers, setSearchUsers] = useState<UserI[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const loadingMoreRef = useRef(false);

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

    // Search logic
    useEffect(() => {
        if (debouncedQuery.length < MIN_QUERY_LENGTH) {
            setSearchUsers([]);
            setHasMore(false);
            return;
        }
        fetchSearchUsers(debouncedQuery, 0, INITIAL_LIMIT, false);
    }, [debouncedQuery]);

    const fetchSearchUsers = async (query: string, skip: number, limit: number, isLoadMore: boolean) => {
        if (isLoadMore) {
            if (loadingMoreRef.current) return;
            loadingMoreRef.current = true;
            setLoadingMore(true);
        } else {
            setSearchLoading(true);
        }
        try {
            const result = await FriendsService.searchUsers(query, skip, limit);
            if (isLoadMore) {
                setSearchUsers(prev => [...prev, ...result.users]);
            } else {
                setSearchUsers(result.users);
            }
            setHasMore(skip + limit < result.count);
        } finally {
            if (isLoadMore) {
                setLoadingMore(false);
                loadingMoreRef.current = false;
            } else {
                setSearchLoading(false);
            }
        }
    };

    const loadMore = useCallback(() => {
        if (loadingMoreRef.current || !hasMore || debouncedQuery.length < MIN_QUERY_LENGTH) return;
        fetchSearchUsers(debouncedQuery, searchUsers.length, LOAD_MORE_LIMIT, true);
    }, [debouncedQuery, searchUsers.length, hasMore]);

    const isSearchMode = debouncedQuery.length >= MIN_QUERY_LENGTH;
    const initialSearchLoading = searchLoading && searchUsers.length === 0;
    const noSearchResults = !initialSearchLoading && !searchLoading && searchUsers.length === 0 && isSearchMode;
    const showEndOfResults = !initialSearchLoading && !loadingMore && !hasMore && searchUsers.length > 0;

    if (loading) {
        return <Loading></Loading>
    }
    return (
        <div className="list-view">

            {!!isMyAccount && (
                <FloatingInput
                    className="pt-1 pb-5 px-4"
                    mode={FloatingInputModes.THIN}
                    name="freeText"
                    value={freeTextInput}
                    onChange={e => setFreeTextInput(e.target.value)}
                    label={t("employeeProfile.form.freeText")}
                    fullWidth
                    icon={isSearchMode ? <Close /> : <Search />}
                    onIconClick={isSearchMode ? (e) => {
                        e.preventDefault();
                        setFreeTextInput('')
                    } : undefined}
                />

            )}

            {isSearchMode ? (
                <>
                    {initialSearchLoading ? (
                        <div className="flex flex-col items-center justify-center mt-20">
                            <Loading />
                        </div>
                    ) : noSearchResults ? (
                        <div className="flex flex-col items-center justify-center mt-20">
                            <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {searchUsers.map(user => (
                                <div className="list-view-item" key={user.uid}>
                                    <UserInvitationListItem user={user} />
                                </div>
                            ))}
                            <InfiniteScrollEventEmitter emitEvent={loadMore} />
                        </div>
                    )}

                    {loadingMore && searchUsers.length > 0 && (
                        <div className="flex justify-center py-6">
                            <Loading />
                        </div>
                    )}

                    {showEndOfResults && (
                        <div className="flex justify-center py-4">
                            <span className="secondary-text s-font">{t('common.endOfResults')}</span>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-1">
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
                </>
            )}
        </div>
    )
}

export default FriendsListView;