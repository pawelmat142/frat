import React from "react";
import { ChatMessageI, MessageTypes } from "@shared/interfaces/ChatI";
import { DateUtil } from "@shared/utils/DateUtil";
import { Ico } from "global/icon.def";
import { FaFileAlt } from "react-icons/fa";

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
                    {msg.imageRefs.map((ref, i) => {
                        if (!ref.isImage) {
                            return (
                                <div key={i} className="chat-view-message-file">
                                    <a href={ref.url} target="_blank" rel="noopener noreferrer" 
                                    className="flex items-center justify-center h-full gap-2 flex-col pt-3 px-3">
                                        <FaFileAlt size={50} />
                                        <span className="truncate s-font secondary-text">{ref.filename}</span>
                                    </a>
                                </div>
                            );
                        }
                        return (
                            <img
                                key={i}
                                src={ref.url}
                                alt=""
                                className="chat-view-message-image"
                                onClick={() => window.open(ref.url, "_blank")}
                            />
                        )
                    })}
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

    // TODO delete on long tap 
    return bubble
    // if (!isOwn) return bubble;
};

export default ChatMessageBubble;
