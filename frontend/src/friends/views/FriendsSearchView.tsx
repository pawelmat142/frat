import { useTranslation } from "react-i18next"
import FloatingInput from "global/components/controls/FloatingInput"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDebouncedValue } from "global/utils/useDebouncedValue"
import { UserI } from "@shared/interfaces/UserI"
import { FloatingInputModes } from "global/interface/controls.interface"
import { Search } from "@mui/icons-material"
import { FriendsService } from "friends/services/FriendsService"
import Loading from "global/components/Loading"
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter"
import FloatingScrollButton from "global/components/buttons/FloatingScrollButton"
import UserInvitationListItem from "user/components/UserInvitationListItem"

const INITIAL_LIMIT = 20;
const LOAD_MORE_LIMIT = 10;
const MIN_QUERY_LENGTH = 3;

const FriendsSearchView: React.FC = () => {

    const { t } = useTranslation()

    const [freeTextInput, setFreeTextInput] = useState('');
    const debouncedQuery = useDebouncedValue(freeTextInput, 500);

    const [users, setUsers] = useState<UserI[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const loadingMoreRef = useRef(false);

    useEffect(() => {
        if (debouncedQuery.length < MIN_QUERY_LENGTH) {
            setUsers([]);
            setHasMore(false);
            return;
        }
        searchUsers(debouncedQuery, 0, INITIAL_LIMIT, false);
    }, [debouncedQuery]);

    const searchUsers = async (query: string, skip: number, limit: number, isLoadMore: boolean) => {
        if (isLoadMore) {
            if (loadingMoreRef.current) return;
            loadingMoreRef.current = true;
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const result = await FriendsService.searchUsers(query, skip, limit);
            if (isLoadMore) {
                setUsers(prev => [...prev, ...result.users]);
            } else {
                setUsers(result.users);
            }
            setHasMore(skip + limit < result.count);
        } finally {
            if (isLoadMore) {
                setLoadingMore(false);
                loadingMoreRef.current = false;
            } else {
                setLoading(false);
            }
        }
    };

    const loadMore = useCallback(() => {
        if (loadingMoreRef.current || !hasMore || debouncedQuery.length < MIN_QUERY_LENGTH) return;
        searchUsers(debouncedQuery, users.length, LOAD_MORE_LIMIT, true);
    }, [debouncedQuery, users.length, hasMore]);

    const initialLoading = loading && users.length === 0;
    const isQueryTooShort = debouncedQuery.length < MIN_QUERY_LENGTH && freeTextInput.length > 0;
    const noResults = !initialLoading && !loading && users.length === 0 && debouncedQuery.length >= MIN_QUERY_LENGTH;
    const showEndOfResults = !initialLoading && !loadingMore && !hasMore && users.length > 0;

    return (
        <div className="list-view pt-0">

            <FloatingInput
                className="pt-2 pb-2 px-4"
                mode={FloatingInputModes.THIN}
                name="freeText"
                value={freeTextInput}
                onChange={e => setFreeTextInput(e.target.value)}
                label={t("employeeProfile.form.freeText")}
                fullWidth
                icon={<Search />}
            />

            {isQueryTooShort ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <p className="xl-font mb-4 secondary-text">{t('common.minSearchLength', { count: MIN_QUERY_LENGTH, defaultValue: `Type at least ${MIN_QUERY_LENGTH} characters` })}</p>
                </div>
            ) : initialLoading ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Loading />
                </div>
            ) : noResults ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    {users.map(user => (
                        <div className="list-view-item" key={user.uid}>
                            <UserInvitationListItem
                                user={user}
                            />
                        </div>
                    ))}
                    <InfiniteScrollEventEmitter emitEvent={loadMore} />
                </div>
            )}

            {loadingMore && users.length > 0 && (
                <div className="flex justify-center py-6">
                    <Loading />
                </div>
            )}

            {showEndOfResults && (
                <div className="flex justify-center py-4">
                    <span className="secondary-text s-font">{t('common.endOfResults')}</span>
                </div>
            )}

            <FloatingScrollButton />
        </div>
    )
}

export default FriendsSearchView;