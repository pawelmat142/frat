/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { ToastException } from 'global/exceptions/ToastException';

@Injectable()
export class CloudinaryService {

    private readonly logger = new Logger(this.constructor.name);
    private readonly cloudName: string;
    private readonly apiKey: string;
    private readonly apiSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.cloudName = this.configService.get<string>('REACT_APP_CLOUDINARY_CLOUD_NAME')!;
        this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')!;
        this.apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')!;
    }

    private validateConfig(): void {
        if (!this.cloudName || !this.apiKey || !this.apiSecret) {
            throw new ToastException('cloudinary.error.missingConfig', this);
        }
    }

    /**
     * Deletes an image from Cloudinary by public ID
     * @param publicId - The public ID of the image to delete
     * @returns true if deleted successfully, false otherwise
     */
    async deleteImage(publicId: string): Promise<void> {
        this.validateConfig();
        if (!publicId) {
            throw new ToastException('cloudinary.error.missingPublicId', this);
        }

        if (!this.cloudName || !this.apiKey || !this.apiSecret) {
            throw new ToastException('cloudinary.error.missingConfig', this);
        }

        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = this.generateSignature(publicId, timestamp);

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
                {
                    public_id: publicId,
                    api_key: this.apiKey,
                    timestamp,
                    signature,
                }
            );

            if (response.data.result === 'ok') {
                this.logger.log(`Deleted image from Cloudinary: ${publicId}`);
            } else {
                throw new ToastException('cloudinary.error.deletionFailed', this);
            }
        } catch (error) {
            this.logger.error(`Error deleting image from Cloudinary: ${publicId}`, error);
            throw new ToastException('cloudinary.error.deletionFailed', this);
        }
    }

    private generateSignature(publicId: string, timestamp: number): string {
        const toSign = `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
        return crypto.createHash('sha1').update(toSign).digest('hex');
    }
}
