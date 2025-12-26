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
            throw new ToastException('cloudinary.missingConfig', this);
        }
    }

    public async deleteAllAssetsForUid(uid: string): Promise<void> {
        this.validateConfig();
        const tag = `uid:${uid}`;
        try {
            // Admin API uses Basic Auth
            const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
            
            const response = await axios.delete(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/resources/image/tags/${tag}`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    }
                }
            );
            this.logger.log(`Deleted all assets for UID: ${uid}, result: ${JSON.stringify(response.data)}`);
        } catch (error: any) {
            // 404 means no assets found - that's OK
            if (error.response?.status === 404) {
                this.logger.log(`No assets found for UID: ${uid}`);
                return;
            }
            this.logger.error(`Error deleting all assets for UID: ${uid}`, error);
            throw new ToastException('cloudinary.deletionFailed', this);
        }
    }

    /**
     * Deletes an image from Cloudinary by public ID
     * @param publicId - The public ID of the image to delete
     */
    async deleteImage(publicId: string): Promise<void> {
        this.validateConfig();
        if (!publicId) {
            throw new ToastException('cloudinary.missingPublicId', this);
        }

        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = this.generateSignature({ publicId, timestamp });

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
                {
                    public_id: publicId,
                    api_key: this.apiKey,
                    timestamp,
                    signature,
                }
            );

            if (response.data.result === 'not found') {
                this.logger.warn(`Image not found in Cloudinary: ${publicId}`);
                return
            }
            if (response.data.result === 'ok') {
                this.logger.log(`Deleted image from Cloudinary: ${publicId}`);
            } else {
                throw new Error('response.status: ' + response.status);
            }
        } catch (error) {
            this.logger.error(`Error deleting image from Cloudinary: ${publicId}`, error);
            throw new ToastException('cloudinary.deletionFailed', this);
        }
    }

    private generateSignature(params: {
        publicId?: string;
        tag?: string;
        timestamp: number;
    }): string {
        const { publicId, tag, timestamp } = params;
        
        // Build params alphabetically (Cloudinary requirement)
        const paramsArray: string[] = [];
        if (publicId) paramsArray.push(`public_id=${publicId}`);
        if (tag) paramsArray.push(`tag=${tag}`);
        paramsArray.push(`timestamp=${timestamp}`);
        
        const toSign = paramsArray.sort().join('&') + this.apiSecret;
        return crypto.createHash('sha1').update(toSign).digest('hex');
    }
}
