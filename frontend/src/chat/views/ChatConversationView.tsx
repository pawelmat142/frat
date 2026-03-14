import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatI, ChatMemberWithUserI, ChatMessageI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { ChatService } from "../services/ChatService";
import { chatSocket } from "../services/ChatSocketService";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { Path } from "../../path";
import { useGlobalContext } from "global/providers/GlobalProvider";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { BtnModes, MenuItem } from "global/interface/controls.interface";
import { DateUtil } from "@shared/utils/DateUtil";
import { useMenuContext } from "global/providers/MenuProvider";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import UserItem from "user/components/UserItem";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";

const ChatConversationView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const userCtx = useUserContext();
    const me = userCtx?.me;

    const [chat, setChat] = useState<ChatWithMembers | null>(null);
    const [messages, setMessages] = useState<ChatMessageI[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isInitialized = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll to bottom when virtual keyboard opens
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const onResize = () => {
            scrollToBottom();
        };

        viewport.addEventListener("resize", onResize);
        return () => viewport.removeEventListener("resize", onResize);
    }, []);

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
            items.push({
                label: t('account.showProfile'),
                onClick: () => navigate(Path.getProfilePath(otherUser?.uid || ''))
            });
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
        if (!otherUser) return;
        const chatViewHeaderContent = <div className="flex gap-2 items-center">
            <HeaderBackBtn></HeaderBackBtn>
            <UserItem user={otherUser} size={2.5}></UserItem>
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
            setChat(prev => prev ? ({
                ...chatEvent,
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
                                        {!!msg.readAt && !leftSide && (
                                            <span className="primary-color"><Ico.CHECK size={12}/></span>
                                        )}
                                        <span className="xs-font">{DateUtil.displayTime(msg.createdAt)}</span>
                                    </div>

                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className={`chat-view-input${inputFocused ? ' focus bottom-bar-shadow' : ''}`}>
{/* 
                <div className="chat-view-input-left">
                    <FaSearch size={iconSize} />
                    <FaBriefcase size={iconSize} />
                </div> */}

                <div className="chat-view-input-content">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('chat.typeMessage')}
                        className="chat-view-input-content-control"
                        disabled={sending || !!chat?.blockedByUid}
                        enterKeyHint="send"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="sentences"
                        spellCheck={false}
                        onFocus={() => {
                            setInputFocused(true);
                            setTimeout(scrollToBottom, 300);
                        }}
                        onBlur={() => setInputFocused(false)}
                    />
                </div>

                <div className="chat-view-input-left">
                    {/* <FaBriefcase size={iconSize} /> */}
                    {/* <FaSearch size={iconSize} /> */}
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-2"
                    >
                        <Ico.MSG size={iconSize * 1.2} />
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default ChatConversationView;
