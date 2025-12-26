import { AvatarRef, UserI } from '@shared/interfaces/UserI';
import axios from 'axios';
import { UserManagementService } from './UserManagementService';

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
const AVATAR_SIZE = 200;

const validateCloudinaryConfig = (): void => {
    if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error('REACT_APP_CLOUDINARY_CLOUD_NAME is not defined');
    }
    if (!CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('REACT_APP_CLOUDINARY_UPLOAD_PRESET is not defined');
    }
};

export const AvatarService = {

    /**
     * Resizes and center-crops an image to 200x200
     * @param file - The image file to process
     * @returns Promise with the processed File
     */
    resizeAndCropImage: (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            img.onload = () => {
                canvas.width = AVATAR_SIZE;
                canvas.height = AVATAR_SIZE;

                // Calculate crop dimensions (center crop to square)
                const size = Math.min(img.width, img.height);
                const offsetX = (img.width - size) / 2;
                const offsetY = (img.height - size) / 2;

                // Draw cropped and resized image
                ctx.drawImage(
                    img,
                    offsetX, offsetY, size, size,  // source (crop from center)
                    0, 0, AVATAR_SIZE, AVATAR_SIZE  // destination (200x200)
                );

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Could not create blob from canvas'));
                            return;
                        }
                        const resizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    },
                    'image/jpeg',
                    0.9 // quality
                );

                URL.revokeObjectURL(img.src);
            };

            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                reject(new Error('Could not load image'));
            };
            img.src = URL.createObjectURL(file);
        });
    },

    /**
     * Uploads an image file to Cloudinary
     * @param file - The image file to upload
     * @param folder - Optional folder path in Cloudinary (e.g., 'avatars')
     * @returns Promise with the upload result containing URL and public ID
     */
    uploadImage: async (file: File, folder?: string): Promise<AvatarRef> => {
        validateCloudinaryConfig();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!);
        
        if (folder) {
            formData.append('folder', folder);
        }

        const { data } = await axios.post<CloudinaryUploadResponse>(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
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
     * @param userId - User ID for organizing files
     * @returns Promise with the updated user
     */
    uploadAvatar: async (file: File, userId: string): Promise<UserI> => {
        const resizedFile = await AvatarService.resizeAndCropImage(file);
        const avatarRef = await AvatarService.uploadImage(resizedFile, `avatars/${userId}`);
        return UserManagementService.updateAvatar(avatarRef);
    },

}