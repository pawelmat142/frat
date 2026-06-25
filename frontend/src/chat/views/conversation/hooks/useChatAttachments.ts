import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { ChatMessageI } from "@shared/interfaces/ChatI";
import { FileUtil } from "global/utils/FileUtil";
import { AppConfig } from "@shared/AppConfig";

export interface PendingAttachment {
    file: File;
    optimizedFile: File;
    previewUrl?: string;
    isImage: boolean;
}

const MAX_STORAGE_BYTES = AppConfig.CHAT_MAX_IMAGE_STORAGE_MB * 1024 * 1024;

export const useChatAttachments = (messages: ChatMessageI[]) => {
    const { t } = useTranslation();
    const confirm = useConfirm();

    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
    const [optimizing, setOptimizing] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getExistingStorageBytes = () =>
        messages.reduce(
            (sum, msg) => sum + (msg.imageRefs?.length ?? 0) * AppConfig.UPLOAD_IMG_TARGET_OUTPUT_SIZE_BYTES,
            0,
        );

    const getPendingBytes = () =>
        pendingAttachments.reduce((sum, p) => sum + p.optimizedFile.size, 0);

    const resetInputs = () => {
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const checkStorageLimit = (incomingBytes: number): boolean => {
        const totalAfter = getExistingStorageBytes() + getPendingBytes() + incomingBytes;
        if (totalAfter > MAX_STORAGE_BYTES) {
            confirm({
                title: t("chat.storageLimitTitle"),
                message: t("chat.storageLimitMessage", { limit: AppConfig.CHAT_MAX_IMAGE_STORAGE_MB }),
                confirmText: "common.ok",
                cancelText: "common.cancel",
            });
            return false;
        }
        return true;
    };

    const removePendingAttachment = (index: number) => {
        setPendingAttachments(prev => {
            const attachment = prev[index];
            if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
        resetInputs();
    };

    const clearPendingAttachments = () => {
        setPendingAttachments(prev => {
            prev.forEach(p => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
            return [];
        });
        resetInputs();
    };

    /** Image picker: validates format, optimizes, creates preview. */
    const handleImagesSelected = async (files: FileList) => {
        if (!files.length) return;

        for (const file of Array.from(files)) {
            const error = FileUtil.validateImage(file);
            if (error) {
                toast.error(t(error));
                return;
            }
        }

        setOptimizing(true);
        try {
            const newAttachments = await Promise.all(
                Array.from(files).map(async file => {
                    const optimizedFile = await FileUtil.resizeForMobile(file);
                    return {
                        file,
                        optimizedFile,
                        previewUrl: URL.createObjectURL(optimizedFile),
                        isImage: true as const,
                    };
                }),
            );

            const incomingBytes = newAttachments.reduce((sum, a) => sum + a.optimizedFile.size, 0);
            if (!checkStorageLimit(incomingBytes)) {
                newAttachments.forEach(a => URL.revokeObjectURL(a.previewUrl));
                return;
            }

            setPendingAttachments(prev => [...prev, ...newAttachments]);
        } catch {
            toast.error(t("chat.error.fileOptimizationFailed"));
        } finally {
            setOptimizing(false);
        }
    };

    /** File/document picker: rejects images, skips optimization and format validation. */
    const handleFilesSelected = async (files: FileList) => {
        if (!files.length) return;

        const nonImages = Array.from(files).filter(file => {
            if (file.type.startsWith("image/")) {
                toast.warn(t("chat.error.useImageButton"));
                return false;
            }
            return true;
        });

        if (!nonImages.length) return;

        const incomingBytes = nonImages.reduce((sum, f) => sum + f.size, 0);
        if (!checkStorageLimit(incomingBytes)) return;

        const newAttachments = nonImages.map(file => ({
            file,
            optimizedFile: file,
            previewUrl: undefined,
            isImage: false as const,
        }));

        setPendingAttachments(prev => [...prev, ...newAttachments]);
    };

    return {
        pendingAttachments,
        optimizing,
        imageInputRef,
        fileInputRef,
        handleImagesSelected,
        handleFilesSelected,
        removePendingAttachment,
        clearPendingAttachments,
    };
};
