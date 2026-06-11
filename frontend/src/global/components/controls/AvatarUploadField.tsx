import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { AVATAR_SIZE, CloudinaryService } from "user/services/CloudinaryService";
import Loading from "global/components/Loading";
import { BtnModes } from "global/interface/controls.interface";
import { AvatarRef } from "@shared/interfaces/UserI";
import FormError from "./FormError";
import Button from "./Button";
import { AppConfig } from "@shared/AppConfig";
import { FileUtil } from "global/utils/FileUtil";
import { CloudinaryTags } from "@shared/utils/CloudinaryUtil";

interface AvatarUploadFieldProps {
    value: AvatarRef | null;
    onChange: (avatarRef: AvatarRef | null) => void;
    error?: { message?: string } | null;
    required?: boolean;
    folder?: string; // Optional custom folder for Cloudinary upload
    tags?: string[]; // Optional custom tags for Cloudinary upload
    btnTitle?: string; 
    imgPlaceholder?: string; 
}

const AVATAR_PLACEHOLDER = AppConfig.AVATAR_PLACEHOLDER;
const ALLOWED_EXTENSIONS = [...AppConfig.UPLOAD_IMG_ALLOWED_EXTENSIONS] as string[];

const AvatarUploadField: React.FC<AvatarUploadFieldProps> = ({
    value,
    onChange,
    error,
    required,
    folder,
    tags,
    btnTitle,
    imgPlaceholder = AVATAR_PLACEHOLDER,
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);

    const handleClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;


        const error = FileUtil.validateImage(file);
        if (error) {
            toast.error(t(error, { allowed: FileUtil.ALLOWED_IMAGE_EXTENSIONS.join(', '), max: FileUtil.MAX_FILE_SIZE_MB }));
            e.target.value = '';
            return;
        }

        setIsUploading(true);
        try {
            const optimizedFile = await FileUtil.resizeAndCropSquare(file, AVATAR_SIZE);

            // Show preview immediately
            const previewUrl = URL.createObjectURL(optimizedFile);
            setPreviewSrc(previewUrl);

            // Upload to Cloudinary
            const folderr = folder || 'avatars/temp';
            const tagss = tags || [CloudinaryTags.AVATAR, CloudinaryTags.TEMP];
            const avatarRef = await CloudinaryService.uploadImage(optimizedFile, folderr, tagss);

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

    const displaySrc = previewSrc || value?.url || imgPlaceholder;
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
                        >{ btnTitle || t('employeeProfile.form.uploadAvatar')}</Button>
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
