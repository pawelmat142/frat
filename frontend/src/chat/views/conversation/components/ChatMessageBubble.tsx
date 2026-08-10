import React from "react";
import {ChatMessageI, MessageTypes} from "@shared/interfaces/ChatI";
import {DateUtil} from "@shared/utils/DateUtil";
import {Ico} from "global/icon.def";
import {FaFileAlt} from "react-icons/fa";
import LongTapHandler from "global/components/LongTapHandler";

interface Props {
    msg: ChatMessageI;
    isOwn: boolean;
    onLongTap: (x: number, y: number) => void;
}

const ChatMessageBubble: React.FC<Props> = ({ msg, isOwn, onLongTap }) => {
    const leftSide = !isOwn;

    const openImage = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(url, "_blank");
    }

    const downloadFile = async (e: React.MouseEvent, url: string, filename?: string) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || url.split('/').pop() || 'file';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed', err);
        }
    }

    return (
        <LongTapHandler
            onLongTap={onLongTap}
            className={`chat-view-message ${leftSide ? "left" : "right"} ${msg.type === MessageTypes.IMAGE ? "image" : ""} relative`}
        >
            {msg.type === MessageTypes.IMAGE && !!msg.fileRefs?.length && (
                <div className={`chat-view-message-images count-${Math.min(msg.fileRefs.length, 4)}`}>
                    {msg.fileRefs.map((ref, i) => {
                        if (!ref.isImage) {
                            return (
                                <div key={i} className="chat-view-message-file">
                                    <button
                                        type="button"
                                        onClick={(e) => downloadFile(e, ref.url, ref.filename)}
                                        className="flex items-center justify-center w-full h-full gap-2 flex-col pt-3 px-3"
                                    >
                                        <FaFileAlt size={50}/>
                                        <span className="truncate w-full min-w-0 text-center s-font secondary-text">{ref.filename}</span>
                                    </button>
                                </div>
                            );
                        }
                        return (
                            <img
                                key={i}
                                src={ref.url}
                                alt=""
                                className="chat-view-message-image"
                                onClick={(e) => openImage(e, ref.url)}
                            />
                        )
                    })}
                </div>
            )}
            {msg.content && <p>{msg.content}</p>}
            <div className="chat-view-message-info">
                {!!msg.readAt && isOwn && (
                    <span className="primary-color">
                        <Ico.CHECK size={12}/>
                    </span>
                )}
                <span className="xs-font">{DateUtil.displayTime(msg.createdAt)}</span>
            </div>
        </LongTapHandler>
    );
};

export default ChatMessageBubble;
