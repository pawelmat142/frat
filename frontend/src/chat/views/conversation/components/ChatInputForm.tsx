import React from "react";
import { useTranslation } from "react-i18next";
import { FaFileUpload, FaImage } from "react-icons/fa";
import { Ico } from "global/icon.def";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import { useChatConversationContext } from "../ChatConversationProvider";

const ICON_SIZE = 22;

const ChatInputForm: React.FC = () => {
    const { t } = useTranslation();
    const {
        chat,
        newMessage, setNewMessage,
        sending, optimizing,
        inputFocused, setInputFocused,
        handleSendMessage,
        inputRef, imageInputRef, fileInputRef,
        handleImagesSelected, handleFilesSelected,
        pendingAttachments,
        scrollToBottom,
    } = useChatConversationContext();

    const isBlocked = !!chat?.blockedByUid;
    const isBusy = sending || optimizing;
    const canSend = !!(newMessage.trim() || pendingAttachments.length);
    const showUploadButtons = !inputFocused && !newMessage && !isBlocked;

    return (
        <form
            onSubmit={handleSendMessage}
            className={`chat-view-input${inputFocused ? " focus bottom-bar-shadow" : ""}`}
        >
            {/* Hidden input — image gallery (accept image/*, triggers gallery on mobile) */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) handleImagesSelected(e.target.files); }}
            />

            {/* Hidden input — document/file picker (non-image accept, triggers Files app on mobile) */}
            <input
                ref={fileInputRef}
                type="file"
                accept="application/*,text/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) handleFilesSelected(e.target.files); }}
            />

            {/* Upload buttons — visible only when input is idle */}
            {showUploadButtons && (
                <div className="chat-view-input-left">
                    <Button mode={BtnModes.PRIMARY_TXT} type="button" className="px-2"
                        onClick={() => fileInputRef.current?.click()} disabled={isBusy}
                        title={t("chat.uploadFile")}
                    >
                        <FaFileUpload size={ICON_SIZE} />
                    </Button>
                    <Button mode={BtnModes.PRIMARY_TXT} type="button" className="px-2"
                        onClick={() => imageInputRef.current?.click()} disabled={isBusy}
                        title={t("chat.uploadImage")}
                    >
                        <FaImage size={ICON_SIZE} />
                    </Button>
                </div>
            )}

            {/* Text input */}
            <div className="chat-view-input-content">
                <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={pendingAttachments.length ? t("chat.addCaption") : t("chat.typeMessage")}
                    className="chat-view-input-content-control"
                    disabled={isBusy || isBlocked}
                    enterKeyHint="send"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="sentences"
                    spellCheck={false}
                    onFocus={() => { setInputFocused(true); setTimeout(scrollToBottom, 300); }}
                    onBlur={() => setInputFocused(false)}
                />
            </div>

            {/* Send / loading button */}
            <div className="chat-view-input-left">
                {isBusy ? (
                    <Button mode={BtnModes.PRIMARY_TXT} disabled={!canSend} className="px-2">
                        <Ico.WAIT size={ICON_SIZE * 1.2} />
                    </Button>
                ) : (
                    <Button mode={BtnModes.PRIMARY_TXT} type="submit" disabled={!canSend} className="px-2">
                        <Ico.MSG size={ICON_SIZE * 1.2} />
                    </Button>
                )}
            </div>
        </form>
    );
};

export default ChatInputForm;
