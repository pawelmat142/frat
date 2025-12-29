import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatI, ChatMessageI } from "@shared/interfaces/ChatI";
import { ChatService } from "../services/ChatService";
import { chatSocket } from "../services/ChatSocketService";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { Path } from "../../path";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

const ChatConversationView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const { me } = useAuthContext();

    const [chat, setChat] = useState<ChatI | null>(null);
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

        chatSocket.onMessage(numericChatId, (message) => {
            setMessages(prev => {
                // Check for duplicate using current state
                if (prev.some(m => m.messageId === message.messageId)) {
                    return prev;
                }
                console.log('Received message:', message);
                return [...prev, message];
            });
        });

        return () => {
            chatSocket.offMessage(numericChatId);
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
            const response = await chatSocket.sendMessage(numericChatId, newMessage.trim());
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

    const getOtherMember = () => {
        if (!me || !chat || !(chat as any).members) return null;
        return (chat as any).members.find((m: any) => m.uid !== me.uid)?.user;
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <Loading />;
    }

    const otherUser = getOtherMember();

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b">
                <button
                    onClick={() => navigate(Path.CHATS)}
                    className="p-2 rounded-full hover:bg-opacity-80"
                >
                    <FaArrowLeft />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {otherUser?.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                    <div className="font-semibold">
                        {otherUser?.displayName || t('chat.unknownUser')}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center secondary-text py-8">
                        {t('chat.noMessages')}
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderUid === me?.uid;
                        return (
                            <div
                                key={msg.messageId}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                        isMe
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'card-bg rounded-bl-none'
                                    }`}
                                >
                                    <p className="break-words">{msg.content}</p>
                                    <div className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'secondary-text'}`}>
                                        {formatTime(msg.createdAt)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('chat.typeMessage')}
                        className="flex-1 px-4 py-2 rounded-full input-field"
                        disabled={sending}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-full px-4"
                    >
                        <FaPaperPlane />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChatConversationView;
