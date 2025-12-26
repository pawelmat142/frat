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
     * Uploads an avatar image with automatic transformation
     * @param file - The image file to upload
     * @param userId - User ID for organizing files
     * @returns Promise with the upload result
     */
    uploadAvatar: async (file: File, userId: string): Promise<UserI> => {
        const avatarRef = await AvatarService.uploadImage(file, `avatars/${userId}`);
        return UserManagementService.updateAvatar(avatarRef);
    },

    /**
     * Generates a Cloudinary URL with transformations
     * @param publicId - The public ID of the image
     * @param options - Transformation options
     * @returns Transformed image URL
     */
    getTransformedUrl: (
        publicId: string,
        options: { width?: number; height?: number; crop?: string } = {}
    ): string => {
        validateCloudinaryConfig();

        const { width = 200, height = 200, crop = 'fill' } = options;
        const transformations = `w_${width},h_${height},c_${crop},g_face,q_auto,f_auto`;

        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
    },

    /**
     * Deletes an image from Cloudinary (requires backend endpoint for signed deletion)
     * Note: For security, deletion should be done via backend
     * @param publicId - The public ID of the image to delete
     */
    deleteImage: async (publicId: string): Promise<void> => {
        // Deletion requires signed request - should be implemented on backend
        console.warn('Image deletion should be handled by backend for security');
        throw new Error('Delete operation requires backend implementation');
    },

}