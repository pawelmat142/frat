import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatMemberWithUserI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { UserI } from "@shared/interfaces/UserI";
import Loading from "global/components/Loading";
import { Path } from "../../path";
import ChatListItem from "./ChatListItem";
import { useChatsContext } from "chat/ChatsProvider";
import { Ico } from "global/icon.def";
import Button from "global/components/controls/Button";
import { BtnModes, FloatingInputModes } from "global/interface/controls.interface";
import { useUserContext } from "user/UserProvider";
import { useDebouncedValue } from "global/utils/useDebouncedValue";
import { FriendsService } from "friends/services/FriendsService";
import FloatingInput from "global/components/controls/FloatingInput";
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter";
import UserItem from "user/components/UserItem";
import { Close, Search } from "@mui/icons-material";
import { useOpenChat } from "chat/hooks/useOpenChat";
import DesktopChatListItemMenu from "./DesktopChatListItemMenu";

interface Props {
    selectedChatId?: string;
    showSearch?: boolean;
}

const ChatListPanel: React.FC<Props> = ({ selectedChatId, showSearch = false }) => {
    const INITIAL_LIMIT = 20;
    const LOAD_MORE_LIMIT = 10;
    const MIN_QUERY_LENGTH = 3;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { me } = useUserContext();
    const { chats } = useChatsContext();
    const openDirectChat = useOpenChat();
    const [freeTextInput, setFreeTextInput] = useState("");
    const debouncedQuery = useDebouncedValue(freeTextInput, 500);
    const [searchUsers, setSearchUsers] = useState<UserI[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const loadingMoreRef = useRef(false);

    const openChat = (chatId: number) => navigate(Path.getConversationPath(chatId));

    const getOtherMember = (chat: ChatWithMembers): ChatMemberWithUserI | null | undefined => {
        if (!me || !chat.members) return null;
        return chat.members.find((member: ChatMemberWithUserI) => member.uid !== me.uid);
    };

    const isSearchMode = showSearch && debouncedQuery.length >= MIN_QUERY_LENGTH;
    const initialSearchLoading = searchLoading && searchUsers.length === 0;
    const noSearchResults = !initialSearchLoading && !searchLoading && searchUsers.length === 0 && isSearchMode;
    const showEndOfResults = !initialSearchLoading && !loadingMore && !hasMore && searchUsers.length > 0;

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
                setSearchUsers(previous => [...previous, ...result.users]);
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

    useEffect(() => {
        if (!showSearch || debouncedQuery.length < MIN_QUERY_LENGTH) {
            setSearchUsers([]);
            setHasMore(false);
            return;
        }
        void fetchSearchUsers(debouncedQuery, 0, INITIAL_LIMIT, false);
    }, [debouncedQuery, showSearch]);

    const loadMore = useCallback(() => {
        if (loadingMoreRef.current || !hasMore || !isSearchMode) return;
        void fetchSearchUsers(debouncedQuery, searchUsers.length, LOAD_MORE_LIMIT, true);
    }, [debouncedQuery, hasMore, isSearchMode, searchUsers.length]);

    if (!me) return <Loading />;

    const searchFriends = () => navigate(Path.getFriendsPath(me.uid));

    return (
        <div className="list-view chat-list-panel">
            {showSearch && (
                <div className="desktop-chat-list-header">
                    <h1 className="desktop-chat-list-title">{t("chat.chats")}</h1>
                    <FloatingInput
                        mode={FloatingInputModes.THIN}
                        name="chatUsersSearch"
                        value={freeTextInput}
                        onChange={event => setFreeTextInput(event.target.value)}
                        label={t("employeeProfile.form.freeText")}
                        fullWidth
                        icon={isSearchMode ? <Close /> : <Search />}
                        iconClassName={isSearchMode ? "floating-input-clear" : undefined}
                        onIconClick={isSearchMode ? event => {
                            event.preventDefault();
                            setFreeTextInput("");
                        } : undefined}
                    />
                </div>
            )}

            {isSearchMode ? (
                <div className="desktop-chat-search-results">
                    {initialSearchLoading ? (
                        <div className="flex justify-center py-8"><Loading /></div>
                    ) : noSearchResults ? (
                        <p className="secondary-text text-center py-8">{t("common.noResults")}</p>
                    ) : (
                        searchUsers.map(user => (
                            <div className="desktop-chat-search-result list-item-border" key={user.uid}>
                                <UserItem user={user} allowNavigate={false} />
                                <Button mode={BtnModes.PRIMARY_TXT} onClick={() => void openDirectChat(user.uid)}>
                                    <Ico.MSG />
                                    {t("chat.openChat")}
                                </Button>
                            </div>
                        ))
                    )}

                    {searchUsers.length > 0 && <InfiniteScrollEventEmitter emitEvent={loadMore} />}
                    {loadingMore && <div className="flex justify-center py-6"><Loading /></div>}
                    {showEndOfResults && (
                        <div className="flex justify-center py-4">
                            <span className="secondary-text s-font">{t("common.endOfResults")}</span>
                        </div>
                    )}
                </div>
            ) : chats.length === 0 ? (
                <>
                    <div className="text-center secondary-text py-8">
                        <Ico.CHAT className="mx-auto text-4xl mb-2 opacity-50" />
                        <p>{t("chat.noChats")}</p>
                    </div>

                    {!showSearch && (
                        <div className="flex flex-col gap-3 mt-6 px-5">
                            <Button fullWidth mode={BtnModes.SECONDARY} onClick={searchFriends}>
                                <Ico.SEARCH className="mr-2" />
                                {t("friends.search")}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col">
                    {chats.map((chat, index) => {
                        const otherMember = getOtherMember(chat);
                        if (!otherMember) return null;
                        const isActive = `${chat.chatId}` === selectedChatId;

                        return (
                            <div
                                onClick={() => isActive ? navigate(Path.CHATS) : openChat(chat.chatId)}
                                key={chat.chatId}
                            >
                                <ChatListItem
                                    chat={chat}
                                    otherMember={otherMember}
                                    first={index === 0}
                                    last={index === chats.length - 1}
                                    className={`chat-list-panel-item${isActive ? " worker-search-list-item-selected" : ""}`}
                                    rightSection={showSearch ? <DesktopChatListItemMenu chat={chat} otherMember={otherMember} /> : undefined}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatListPanel;