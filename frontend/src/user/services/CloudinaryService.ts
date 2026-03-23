import { AvatarRef, UserI } from '@shared/interfaces/UserI';
import axios from 'axios';
import { UserManagementService } from './UserManagementService';
import { FileUtil } from 'global/utils/FileUtil';
import { AppConfig } from '@shared/AppConfig';
import { CloudinaryFolderNames, CloudinaryTags } from '@shared/utils/CloudinaryUtil';

interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}


const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
export const AVATAR_SIZE = 200;

const CLOUDINARY_BASE_URL = AppConfig.CLOUDINARY_BASE_URL;

const validateCloudinaryConfig = (): void => {
    if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error('REACT_APP_CLOUDINARY_CLOUD_NAME is not defined');
    }
    if (!CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('REACT_APP_CLOUDINARY_UPLOAD_PRESET is not defined');
    }
};

export const CloudinaryService = {
    /**
     * Uploads an image file to Cloudinary
     * @param file - The image file to upload
     * @param folder - Optional folder path in Cloudinary (e.g., 'avatars')
     * @param tags - Optional tags for searching/filtering assets
     * @returns Promise with the upload result containing URL and public ID
     */
    uploadImage: async (file: File, folder?: string, tags?: string[]): Promise<AvatarRef> => {
        validateCloudinaryConfig();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!);
        
        if (folder) {
            formData.append('folder', folder);
        }

        if (tags?.length) {
            formData.append('tags', tags.join(','));
        }

        const { data } = await axios.post<CloudinaryUploadResponse>(
            `${CLOUDINARY_BASE_URL}/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );

        return {
            url: data.secure_url,
            publicId: data.public_id,
        };
    },

    /**
     * Uploads an avatar image with automatic resize/crop
     * @param file - The image file to upload
     * @param uid - User ID for organizing files
     * @returns Promise with the updated user
     */
    uploadAvatar: async (file: File, uid: string): Promise<UserI> => {
        const resizedFile = await FileUtil.resizeAndCropSquare(file, AVATAR_SIZE);
        const tags = [
            CloudinaryTags.AVATAR,
            CloudinaryTags.USER_AVATAR,
            CloudinaryTags.uid(uid)
        ];
        const folder = `${CloudinaryFolderNames.AVATARS}/${uid}`;
        const avatarRef = await CloudinaryService.uploadImage(resizedFile, folder, tags);
        return UserManagementService.updateAvatar(avatarRef);
    },

}