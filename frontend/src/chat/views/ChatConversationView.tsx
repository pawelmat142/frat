import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatI, ChatMemberWithUserI, ChatMessageI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { ChatService } from "../services/ChatService";
import { chatSocket } from "../services/ChatSocketService";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { Path } from "../../path";
import { FaBriefcase, FaPaperPlane, FaSearch } from "react-icons/fa";
import { useGlobalContext } from "global/providers/GlobalProvider";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { BtnModes, MenuItem } from "global/interface/controls.interface";
import { DateUtil } from "@shared/utils/DateUtil";
import ListItemImg from "global/components/ListItemImg";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import { useMenuContext } from "global/providers/MenuProvider";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";

const ChatConversationView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const { me } = useAuthContext();

    const [chat, setChat] = useState<ChatWithMembers | null>(null);
    const [messages, setMessages] = useState<ChatMessageI[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isInitialized = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getOtherMember = () => {
        if (!me || !chat || !(chat as ChatWithMembers).members) return null;
        return (chat as ChatWithMembers).members.find((m: ChatMemberWithUserI) => m.uid !== me.uid)?.user;
    };

    const otherUser = getOtherMember();
    const globalCtx = useGlobalContext();
    const menuCtx = useMenuContext();
    const confirm = useConfirm();

    const blockedByMe = chat?.blockedByUid === me?.uid;

    const prepareChatMenu = (chat: ChatWithMembers): MenuItem[] => {
        const items: MenuItem[] = [];
        if (!chat?.blockedByUid) {
            if (messages.length) {
                items.push({
                    label: t('chat.cleanChat'),
                    onClick: async () => {
                        const confirmed = await confirm({
                            message: t('chat.cleanChatConfirm'),
                        });
                        if (!confirmed) {
                            return
                        }
                        setLoading(true);
                        await ChatService.cleanChat(chat.chatId);
                        setLoading(false);
                        toast.success(t('chat.cleanChatSuccess'));
                    }
                })
            }

            items.push({
                label: t('chat.blockUser'),
                onClick: async () => {
                    const confirmed = await confirm({
                        message: t('chat.blockUserConfirm'),
                    });
                    if (!confirmed) {
                        return
                    }
                    setLoading(true);
                    await ChatService.blockChat(chat.chatId);
                    setLoading(false);
                    toast.success(t('chat.blockUserSuccess'));
                }
            });
        } else if (chat.blockedByUid === me?.uid) {
            items.push({
                label: t('chat.unblockUser'),
                onClick: async () => {
                    const confirmed = await confirm({
                        message: t('chat.unblockUserConfirm'),
                    });
                    if (!confirmed) {
                        return
                    }
                    setLoading(true);
                    await ChatService.unblockChat(chat.chatId);
                    setLoading(false);
                    toast.success(t('chat.unblockUserSuccess'));
                }
            });
        }
        if (chat?.blockedByUid !== me?.uid) {
            items.push({
                label: t('chat.deleteChat'),
                onClick: async () => {
                    const confirmed = await confirm({
                        message: t('chat.deleteChatConfirm'),
                    });
                    if (!confirmed) {
                        return
                    }
                    setLoading(true);
                    await ChatService.deleteChat(chat.chatId);
                    setLoading(false);
                }
            });
        }
        return items;
    }

    const setViewState = (chat: ChatWithMembers) => {
        const chatViewHeaderContent = <div className="flex gap-2 items-center">
            <HeaderBackBtn></HeaderBackBtn>
            <ListItemImg imgUrl={otherUser?.avatarRef?.url || AVATAR_MOCK} />
            <div className="x-font">{otherUser?.displayName}</div>
        </div>

        globalCtx.setViewState({
            leftBtn: chatViewHeaderContent,
            hideFooter: true,
            stickyHeader: true,
        })
        menuCtx.setupHeaderMenu({
            title: t('chat.chatMenu'),
            items: prepareChatMenu(chat)
        })
    }

    useEffect(() => {
        if (!chatId || isInitialized.current) return;
        isInitialized.current = true;

        const numericChatId = parseInt(chatId, 10);

        const loadChat = async () => {
            try {
                const [chatData, messagesData] = await Promise.all([
                    ChatService.getChatById(numericChatId),
                    ChatService.getChatMessages(numericChatId),
                ]);
                setChat(chatData);
                setMessages(messagesData);
            } catch (error) {
                console.error('Failed to load chat:', error);
                navigate(Path.CHATS);
            } finally {
                setLoading(false);
            }
        };

        loadChat();
        chatSocket.connect().then(() => {
            chatSocket.joinChat(numericChatId);
        });

        const messageListener = (message: ChatMessageI) => {
            setMessages(prev => {
                // Check for duplicate using current state
                if (prev.some(m => m.messageId === message.messageId)) {
                    return prev;
                }
                return [...prev, message];
            });
        }

        const loadChatListener = (chatEvent: ChatI) => {
            if (!chatEvent) {
                navigate(Path.CHATS, { replace: true });
                toast.warn(t('chat.chatDeleted'));
                return
            }
            if (numericChatId !== chatEvent.chatId) {
                return
            }
            setChat(prev => prev ? ({ ...chatEvent,
                members: prev.members
            }) : null);
        };

        chatSocket.registerMessageListener(numericChatId, messageListener);
        chatSocket.registerChatListener(loadChatListener);

        return () => {
            chatSocket.unregisterMessageListener(numericChatId);
            chatSocket.unregisterChatListener(loadChatListener);
            chatSocket.leaveChat(numericChatId);
            isInitialized.current = false;
        };
    }, [chatId]);

    useEffect(() => {
        if (chat) {
            setViewState(chat);
            refreshMessages(chat);
        }
    }, [chat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const refreshMessages = async (chat: ChatWithMembers) => {
        if (chat?.chatId) {
            const messagesData = await ChatService.getChatMessages(chat.chatId);
            setMessages(messagesData);
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || sending) return;

        const numericChatId = parseInt(chatId, 10);
        setSending(true);

        try {
            const response = await chatSocket.sendMessage({
                chatId: numericChatId,
                content: newMessage.trim()
            });
            if (response.success && response.message) {
                setNewMessage("");
                inputRef.current?.focus();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };


    if (loading) {
        return <Loading />;
    }

    const iconSize = 22

    return (
        <div className="chat-view">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pb-5">


                {(!messages.length || chat?.blockedByUid) ? (
                    <div className="text-center secondary-text py-8">
                        {blockedByMe ? t('chat.blockedByMe')
                            : chat?.blockedByUid ? t('chat.blockedByOther') + ` ${otherUser?.displayName}`
                                : t('chat.noMessages')}
                    </div>
                ) : (
                    messages.map((msg) => {
                        const leftSide = msg.senderUid !== me?.uid;
                        return (
                            <div
                                key={msg.messageId}
                                className={`flex ${leftSide ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`chat-view-message ${leftSide ? 'left' : 'right'}`}>
                                    <p>{msg.content}</p>
                                    <div className={`chat-view-message-info`}>
                                        {/* TODO znaczek ze przeczytane */}
                                        {/* {!!msg.readAt && (
                                            <span><FaSearch size={5} /></span>
                                        )} */}
                                        <span>{DateUtil.displayTime(msg.createdAt)}</span>
                                    </div>

                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="chat-view-input">

                <div className="chat-view-input-left">
                    <FaSearch size={iconSize} />
                    <FaBriefcase size={iconSize} />
                </div>

                <div className="chat-view-input-content">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('chat.typeMessage')}
                        className="chat-view-input-content-control"
                        disabled={sending || !!chat?.blockedByUid}
                    />
                </div>

                <div className="chat-view-input-left">
                    {/* <FaBriefcase size={iconSize} /> */}
                    {/* <FaSearch size={iconSize} /> */}
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-0"
                    >
                        <FaPaperPlane size={iconSize * 1.2} />
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default ChatConversationView;
