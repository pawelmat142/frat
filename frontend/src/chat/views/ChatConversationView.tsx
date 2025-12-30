import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatI, ChatMessageI, ChatResponse } from "@shared/interfaces/ChatI";
import { ChatService } from "../services/ChatService";
import { chatSocket } from "../services/ChatSocketService";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { Path } from "../../path";
import { FaBriefcase, FaPaperPlane, FaSearch } from "react-icons/fa";
import { useGlobalContext } from "global/providers/GlobalProvider";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { BtnModes } from "global/interface/controls.interface";
import { DateUtil } from "@shared/utils/DateUtil";
import ListItemImg from "global/components/ListItemImg";
import { AVATAR_MOCK } from "user/components/AvatarTile";

const ChatConversationView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const { me } = useAuthContext();

    const [chat, setChat] = useState<ChatResponse | null>(null);
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
        if (!me || !chat || !(chat as ChatResponse).members) return null;
        return (chat as ChatResponse).members.find((m: any) => m.uid !== me.uid)?.user;
    };

    const otherUser = getOtherMember();

    const globalCtx = useGlobalContext();
    const setViewState = () => {

        const chatViewHeaderContent = <div className="flex gap-2 items-center">
            <HeaderBackBtn></HeaderBackBtn>
            <ListItemImg imgUrl={otherUser?.avatarRef?.url || AVATAR_MOCK} />
            <div className="x-font">{otherUser?.displayName}</div>
        </div>

        globalCtx.setViewState({
            leftBtn: chatViewHeaderContent,
            hideFooter: true,
            stickyHeader: true
        })
    }

    console.log(chat)
    console.log(messages)

    useEffect(() => {
        setViewState();
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
                console.log('Received message:', message);
                return [...prev, message];
            });
        }
        chatSocket.registerMessageListener(numericChatId, messageListener);

        return () => {
            chatSocket.unregisterMessageListener(numericChatId);
            isInitialized.current = false;
        };
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                {messages.length === 0 ? (
                    <div className="text-center secondary-text py-8">
                        {t('chat.noMessages')}
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

                                        {!!msg.readAt && (
                                            <span><FaSearch size={5} /></span>
                                        )}
                                        <span>{DateUtil.displayTime(msg.createdAt)}</span>
                                    </div>
                                    {/* TODO znaczek ze przeczytane */}


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
                        disabled={sending}
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
