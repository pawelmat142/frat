import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AvatarService } from "user/services/AvatarService";
import { Upload, Close } from "@mui/icons-material";
import Loading from "global/components/Loading";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { AvatarRef } from "@shared/interfaces/UserI";
import FormError from "./FormError";
import Button from "./Button";
import RemoveButton from "../buttons/RemoveButton";

interface AvatarUploadFieldProps {
    value: AvatarRef | null;
    onChange: (avatarRef: AvatarRef | null) => void;
    uid?: string;
    error?: { message?: string } | null;
    required?: boolean;
}

export const AVATAR_PLACEHOLDER = "/assets/img/default-avatar.png";
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE_MB = 5;

const AvatarUploadField: React.FC<AvatarUploadFieldProps> = ({
    value,
    onChange,
    uid,
    error,
    required,
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);

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
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            toast.error(validationError);
            e.target.value = '';
            return;
        }

        setIsUploading(true);
        try {
            const optimizedFile = await AvatarService.resizeAndCropImage(file);

            // Show preview immediately
            const previewUrl = URL.createObjectURL(optimizedFile);
            setPreviewSrc(previewUrl);

            // Upload to Cloudinary
            const folder = uid ? `avatars/${uid}` : 'avatars/temp';
            const tags = uid ? ['avatar', 'user-avatar', `uid:${uid}`] : ['avatar', 'temp'];
            const avatarRef = await AvatarService.uploadImage(optimizedFile, folder, tags);

            // Update form value
            onChange(avatarRef);

            // Clear preview (use uploaded URL now)
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewSrc(null);

            toast.success(t('success.avatarUploaded'));
        } catch (err) {
            console.error('Avatar upload error:', err);
            toast.error(t('error.avatarUploadFailed'));
            setPreviewSrc(null);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleRemove = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onChange(null);
        if (previewSrc) {
            URL.revokeObjectURL(previewSrc);
            setPreviewSrc(null);
        }
    };

    const displaySrc = previewSrc || value?.url || AVATAR_PLACEHOLDER;
    const hasAvatar = !!(previewSrc || value?.url);

    return (
        <div className="avatar-upload-field">
            <div
                className={`avatar-upload-tile ${error ? 'avatar-upload-error' : ''}`}
                onClick={handleClick}
            >
                {isUploading ? (
                    <div className="avatar-upload-loading">
                        <Loading />
                    </div>
                ) : (
                    <img src={displaySrc} alt="Avatar" className="avatar-upload-img" />
                )}
            </div>

            <div className="avatar-upload-actions">
                <div>
                    {hasAvatar ? (
                        <Button
                            mode={BtnModes.ERROR_TXT}
                            onClick={handleRemove}
                            disabled={isUploading}
                        >{t('common.reset')}</Button>
                    ) : (
                        <Button
                            mode={BtnModes.PRIMARY}
                            onClick={handleClick}
                            disabled={isUploading}
                        >{t('employeeProfile.form.uploadAvatar')}</Button>
                    )}
                    <div className="mt-1">
                        <FormError error={error} />
                    </div>

                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                    onChange={handleFileChange}
                    hidden
                />
            </div>

        </div>
    );
};

export default AvatarUploadField;
