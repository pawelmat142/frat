/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@shared/AppConfig';
import { CloudinaryTags } from '@shared/utils/CloudinaryUtil';
import axios from 'axios';
import * as crypto from 'crypto';
import { ToastException } from 'global/exceptions/ToastException';

const BASE_URL = AppConfig.CLOUDINARY_BASE_URL;

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
        const tag = CloudinaryTags.uid(uid);
        try {
            // Admin API uses Basic Auth
            const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
            
            const response = await axios.delete(
                `${BASE_URL}/${this.cloudName}/resources/image/tags/${tag}`,
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
     * Deletes all Cloudinary assets matching ALL provided tags.
     * @param tags - Every tag must be present on the asset (AND logic)
     * @param exceptPublicId - Optional publicId to exclude from deletion
     */
    public async deleteImagesWithTags(tags: string[], exceptPublicId?: string): Promise<void> {
        this.validateConfig();
        const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');

        const expression = tags.map(tag => `tags="${tag}"`).join(' AND ');
        try {
            const searchResponse = await axios.post(
                `${BASE_URL}/${this.cloudName}/resources/search`,
                { expression, max_results: 100 },
                { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }
            );

            const resources: { public_id: string }[] = searchResponse.data.resources || [];
            if (resources.length === 0) {
                this.logger.log(`No assets found for tags: ${tags.join(', ')}`);
                return;
            }

            const publicIds = resources
                .map(r => r.public_id)
                .filter(id => id !== exceptPublicId);

            if (publicIds.length === 0) {
                this.logger.log(`No assets to delete for tags: ${tags.join(', ')}${exceptPublicId ? ` (keeping ${exceptPublicId})` : ''}`);
                return;
            }

            const deleteResponse = await axios.delete(
                `${BASE_URL}/${this.cloudName}/resources/image/upload`,
                {
                    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
                    data: { public_ids: publicIds },
                }
            );

            this.logger.log(`Deleted ${publicIds.length} assets for tags: ${tags.join(', ')}, result: ${JSON.stringify(deleteResponse.data)}`);
        } catch (error: any) {
            if (error.response?.status === 404) {
                this.logger.log(`No assets found for tags: ${tags.join(', ')}`);
                return;
            }
            this.logger.error(`Error deleting assets for tags: ${tags.join(', ')}`, error);
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
                `${BASE_URL}/${this.cloudName}/image/destroy`,
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
