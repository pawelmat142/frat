import React from "react";
import { ChatMessageI, MessageTypes } from "@shared/interfaces/ChatI";
import { DateUtil } from "@shared/utils/DateUtil";
import { Ico } from "global/icon.def";
import LongTapHandler from "global/components/LongTapHandler";

interface Props {
    msg: ChatMessageI;
    isOwn: boolean;
    onDelete: () => void;
}

const ChatMessageBubble: React.FC<Props> = ({ msg, isOwn, onDelete }) => {
    const leftSide = !isOwn;

    const bubble = (
        <div className={`chat-view-message ${leftSide ? "left" : "right"} ${msg.type === MessageTypes.IMAGE ? "image" : ""}`}>
            {msg.type === MessageTypes.IMAGE && !!msg.imageRefs?.length && (
                <div className={`chat-view-message-images count-${Math.min(msg.imageRefs.length, 4)}`}>
                    {msg.imageRefs.map((ref, i) => (
                        <img
                            key={i}
                            src={ref.url}
                            alt=""
                            className="chat-view-message-image"
                            onClick={() => window.open(ref.url, "_blank")}
                        />
                    ))}
                </div>
            )}
            {msg.content && <p>{msg.content}</p>}
            <div className="chat-view-message-info">
                {!!msg.readAt && isOwn && (
                    <span className="primary-color">
                        <Ico.CHECK size={12} />
                    </span>
                )}
                <span className="xs-font">{DateUtil.displayTime(msg.createdAt)}</span>
            </div>
        </div>
    );

    if (!isOwn) return bubble;

    return (
        <LongTapHandler onLongTap={onDelete} className="relative">
            {bubble}
        </LongTapHandler>
    );
};

export default ChatMessageBubble;
