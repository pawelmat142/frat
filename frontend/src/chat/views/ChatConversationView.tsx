import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatI, ChatMemberWithUserI, ChatMessageI, ChatWithMembers, MessageTypes } from "@shared/interfaces/ChatI";
import { ChatService } from "../services/ChatService";
import { chatSocket } from "../services/ChatSocketService";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { Path } from "../../path";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { DateUtil } from "@shared/utils/DateUtil";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import UserItem from "user/components/UserItem";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { BtnModes, MenuItem } from "global/interface/controls.interface";
import Header from "global/components/Header";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { CloudinaryService } from "user/services/CloudinaryService";
import { FileUtil } from "global/utils/FileUtil";
import { AppConfig } from "@shared/AppConfig";
import { FaImage } from "react-icons/fa";
import { AvatarRef } from "@shared/interfaces/UserI";
import LongTapHandler from "global/components/LongTapHandler";

interface PendingImage {
    previewUrl: string;
    optimizedFile: File;
}

const ChatConversationView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const globalCtx = useGlobalContext();
    const { chatId } = useParams<{ chatId: string }>();
    const userCtx = useUserContext();
    const me = userCtx?.me;

    const [chat, setChat] = useState<ChatWithMembers | null>(null);
    const [messages, setMessages] = useState<ChatMessageI[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [optimizing, setOptimizing] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInitialized = useRef(false);

    const removePendingImage = (index: number) => {
        setPendingImages(prev => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const clearPendingImages = () => {
        setPendingImages(prev => { prev.forEach(p => URL.revokeObjectURL(p.previewUrl)); return []; });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFilesSelected = async (files: FileList) => {
        if (!files.length) return;
        setOptimizing(true);
        try {
            const newImages = await Promise.all(
                Array.from(files).map(async (file) => {
                    const optimizedFile = await FileUtil.resizeForMobile(file);
                    return { previewUrl: URL.createObjectURL(optimizedFile), optimizedFile };
                })
            );

            // TODO translacje 

            const incomingBytes = newImages.reduce((sum, img) => sum + img.optimizedFile.size, 0);
            const totalAfter = getExistingStorageBytes() + getPendingBytes() + incomingBytes;

            if (totalAfter > MAX_STORAGE_BYTES) {
                newImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
                confirm({
                    title: t('chat.storageLimitTitle'),
                    message: t('chat.storageLimitMessage', { limit: AppConfig.CHAT_MAX_IMAGE_STORAGE_MB }),
                    confirmText: 'common.ok',
                    cancelText: 'common.cancel',
                });
                return;
            }

            setPendingImages(prev => [...prev, ...newImages]);
        } catch (error) {
            toast.error(t('chat.error.imageOptimizationFailed'));
        } finally {
            setOptimizing(false);
        }
    };

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

    useEffect(() => {
        globalCtx.hideFooter();
        return () => {
            globalCtx.showFooter();
        }
    }, []);


    const getOtherMember = () => {
        if (!me || !chat || !(chat as ChatWithMembers).members) return null;
        return (chat as ChatWithMembers).members.find((m: ChatMemberWithUserI) => m.uid !== me.uid)?.user;
    };

    const otherUser = getOtherMember();
    const confirm = useConfirm();

    const MAX_STORAGE_BYTES = AppConfig.CHAT_MAX_IMAGE_STORAGE_MB * 1024 * 1024;

    // Estimate total image bytes already stored in this chat.
    // Each uploaded image was resized to at most UPLOAD_IMG_TARGET_OUTPUT_SIZE_BYTES.
    const getExistingStorageBytes = () =>
        messages.reduce((sum, msg) => sum + (msg.imageRefs?.length ?? 0) * AppConfig.UPLOAD_IMG_TARGET_OUTPUT_SIZE_BYTES, 0);

    const getPendingBytes = () =>
        pendingImages.reduce((sum, p) => sum + p.optimizedFile.size, 0);

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

        const messageDeletedListener = ({ messageId }: { messageId: number; chatId: number }) => {
            setMessages(prev => prev.filter(m => m.messageId !== messageId));
        };
        chatSocket.registerMessageDeletedListener(messageDeletedListener);

        return () => {
            chatSocket.unregisterMessageListener(numericChatId);
            chatSocket.unregisterChatListener(loadChatListener);
            chatSocket.unregisterMessageDeletedListener(messageDeletedListener);
            chatSocket.leaveChat(numericChatId);
            isInitialized.current = false;
        };
    }, [chatId]);

    useEffect(() => {
        if (chat) {
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

    // TODO translacja
    const handleDeleteMessage = async (msg: ChatMessageI) => {
        const confirmed = await confirm({
            message: t('chat.deleteMessageConfirm'),
        });
        if (!confirmed) return;
        const response = await chatSocket.deleteMessage({ messageId: msg.messageId, chatId: msg.chatId });
        if (response.error) {
            toast.error(t('chat.error.deleteFailed'));
        }
    };

    // TODO translacje
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !pendingImages.length) || !chatId || sending) return;

        const numericChatId = parseInt(chatId, 10);
        setSending(true);

        try {
            let imageRefs: AvatarRef[] | undefined;

            if (pendingImages.length) {
                const uploaded = await Promise.all(
                    pendingImages.map(p => CloudinaryService.uploadChatImage(p.optimizedFile, numericChatId))
                );
                imageRefs = uploaded.map(r => ({ url: r.url, publicId: r.publicId }));
            }

            const response = await chatSocket.sendMessage({
                chatId: numericChatId,
                content: newMessage.trim(),
                imageRefs,
            });
            if (response.success && response.message) {
                setNewMessage("");
                clearPendingImages();
                inputRef.current?.focus();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error(t('chat.error.sendFailed'));
        } finally {
            setSending(false);
        }
    };


    if (loading) {
        return <Loading />;
    }

    const iconSize = 22
    
    return (<>
        {!!chat && !!otherUser && (
            <div className="sticky-header">
                <Header leftBtn={<div className="flex gap-2 items-center">
                    <HeaderBackBtn></HeaderBackBtn>
                    <UserItem user={otherUser} size={2.5}></UserItem>
                </div>} menu={{
                    title: t('chat.chatMenu'),
                    items: prepareChatMenu(chat)
                }}></Header>
            </div>
        )}
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
                        const isOwn = !leftSide;
                        const bubble = (
                            <div className={`chat-view-message ${leftSide ? 'left' : 'right'} ${msg.type === MessageTypes.IMAGE ? 'image' : ''}`}>
                                {msg.type === MessageTypes.IMAGE && msg.imageRefs?.length && (
                                    <div className={`chat-view-message-images count-${Math.min(msg.imageRefs.length, 4)}`}>
                                        {msg.imageRefs.map((ref, i) => (
                                            <img
                                                key={i}
                                                src={ref.url}
                                                alt=""
                                                className="chat-view-message-image"
                                                onClick={() => window.open(ref.url, '_blank')}
                                            />
                                        ))}
                                    </div>
                                )}
                                {msg.content && <p>{msg.content}</p>}
                                <div className={`chat-view-message-info`}>
                                    {!!msg.readAt && !leftSide && (
                                        <span className="primary-color"><Ico.CHECK size={12} /></span>
                                    )}
                                    <span className="xs-font">{DateUtil.displayTime(msg.createdAt)}</span>
                                </div>
                            </div>
                        );
                        return (
                            <div
                                key={msg.messageId}
                                className={`flex ${leftSide ? 'justify-start' : 'justify-end'}`}
                            >
                                {isOwn ? (
                                    <LongTapHandler onLongTap={() => handleDeleteMessage(msg)} className="relative">
                                        {bubble}
                                    </LongTapHandler>
                                ) : bubble}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Image preview bar above input */}
            {pendingImages.length > 0 && (
                <div className="chat-view-image-preview">
                    {pendingImages.map((img, i) => (
                        <div key={i} className="chat-view-image-preview-thumb">
                            <img src={img.previewUrl} alt="" />
                            <button
                                type="button"
                                className="chat-view-image-preview-remove"
                                onClick={() => removePendingImage(i)}
                                aria-label={t('chat.removeImage')}
                            >
                                <Ico.CANCEL size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className={`chat-view-input${inputFocused ? ' focus bottom-bar-shadow' : ''}`}>
                {/* Hidden file input - multiple */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) handleFilesSelected(e.target.files);
                    }}
                />

                {/* Upload button - visible only when not focused and no text typed */}
                {!inputFocused && !newMessage && !chat?.blockedByUid && (
                    <div className="chat-view-input-left">
                        <Button
                            mode={BtnModes.PRIMARY_TXT}
                            type="button"
                            className="px-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending || optimizing}
                        >
                            <FaImage size={iconSize} />
                        </Button>
                    </div>
                )}

                <div className="chat-view-input-content">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={pendingImages.length ? t('chat.addCaption') : t('chat.typeMessage')}
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
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        type="submit"
                        disabled={(!newMessage.trim() && !pendingImages.length) || sending || optimizing}
                        className="px-2"
                    >
                        <Ico.MSG size={iconSize * 1.2} />
                    </Button>
                </div>

            </form>
        </div>

    </>)

};

export default ChatConversationView;
