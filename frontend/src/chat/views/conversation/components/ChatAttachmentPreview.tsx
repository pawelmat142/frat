import React from "react";
import { useTranslation } from "react-i18next";
import { FaFileAlt } from "react-icons/fa";
import { Ico } from "global/icon.def";
import { useChatConversationContext } from "../ChatConversationProvider";

const ChatAttachmentPreview: React.FC = () => {
    const { t } = useTranslation();
    const { pendingAttachments, removePendingAttachment } = useChatConversationContext();

    if (!pendingAttachments.length) return null;

    return (
        <div className="chat-view-image-preview">
            {pendingAttachments.map((attachment, i) => (
                <div key={i} className="chat-view-image-preview-thumb">
                    {attachment.isImage && attachment.previewUrl ? (
                        <img src={attachment.previewUrl} alt={attachment.file.name} />
                    ) : (
                        <div className="chat-view-file-preview">
                            <FaFileAlt size={20} />
                            <span>{attachment.file.name}</span>
                        </div>
                    )}
                    <button
                        type="button"
                        className="chat-view-image-preview-remove"
                        onClick={() => removePendingAttachment(i)}
                        aria-label={t("chat.removeAttachment")}
                    >
                        <Ico.CANCEL size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ChatAttachmentPreview;
