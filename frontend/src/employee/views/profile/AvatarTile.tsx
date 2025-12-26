import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AvatarService } from "employee/services/AvatarService";
import { Save, Close, Edit } from "@mui/icons-material";
import Loading from "global/components/Loading";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";

interface AvatarTileProps {
    src?: string;
    alt?: string;
    uid?: string;
    editable?: boolean;
    onAvatarChange?: (url: string, publicId: string) => void;
}

const DEFAULT_AVATAR = "/assets/img/avatar-mock.png";
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE_MB = 5;

const AvatarTile: React.FC<AvatarTileProps> = ({
    src = DEFAULT_AVATAR,
    alt = "Avatar",
    uid,
    editable = false,
    onAvatarChange,
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const validateFile = (file: File): string | null => {
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
            return t('validation.invalidFileType', {
                allowed: ALLOWED_EXTENSIONS.join(', ')
            });
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
            return t('validation.fileTooLarge', { max: MAX_FILE_SIZE_MB });
        }

        return null;
    };

    const handleClick = () => {
        if (editable && !isUploading && !pendingFile) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            toast.error(validationError);
            e.target.value = '';
            return;
        }

        // Show preview and store file for later upload
        const previewUrl = URL.createObjectURL(file);
        setPreviewSrc(previewUrl);
        setPendingFile(file);
        e.target.value = '';
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!pendingFile) return;

        if (!uid) {
            toast.error(t('error.missingUserId'));
            return;
        }

        setIsUploading(true);
        try {
            const result = await AvatarService.uploadAvatar(pendingFile, uid)
            onAvatarChange?.(result.url, result.publicId);
            toast.success(t('success.avatarUploaded'));
            clearPending();
        } catch (error) {
            console.error('Avatar upload error:', error);
            toast.error(t('error.avatarUploadFailed'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        clearPending();
    };

    const clearPending = () => {
        if (previewSrc) {
            URL.revokeObjectURL(previewSrc);
        }
        setPreviewSrc(null);
        setPendingFile(null);
    };

    const displaySrc = previewSrc || src;

    if (isUploading) {
        return <Loading></Loading>
    }

    return (
        <div
            className={`square-tile col-tile avatar-tile`}
        >
            <img src={displaySrc} alt={alt} />
            {isUploading && <div className="avatar-loader" />}

            {editable && (
                <div className="avatar-actions">

                    {!pendingFile ? (
                        <IconButton
                            mode={BtnModes.SECONDARY}
                            size={BtnSizes.SMALL}
                            onClick={handleClick}
                            icon={<Edit fontSize="small" />}
                        ></IconButton>
                    ) : (<>
                        <IconButton
                            size={BtnSizes.SMALL}
                            mode={BtnModes.ERROR}
                            onClick={handleCancel}
                            icon={<Close fontSize="small" />}
                        ></IconButton>

                        <IconButton
                            size={BtnSizes.SMALL}
                            mode={BtnModes.SUCCESS}
                            onClick={handleSave}
                            icon={<Save fontSize="small" />}
                        ></IconButton>
                    </>)}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                        onChange={handleFileChange}
                        hidden
                    />
                </div>
            )}

        </div>
    );
}

export default AvatarTile;