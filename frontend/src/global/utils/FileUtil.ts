import { AppConfig } from "@shared/AppConfig";

export abstract class FileUtil {

    static readonly ALLOWED_IMAGE_EXTENSIONS = [...AppConfig.UPLOAD_IMG_ALLOWED_EXTENSIONS] as string[];
    static readonly MAX_FILE_SIZE_MB = AppConfig.UPLOAD_IMG_MAX_SIZE_MB;

    // Mobile gallery: scale down to fit within 1080px, preserve aspect ratio


    static validateImage(file: File): string | null {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !FileUtil.ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
            return `validation.invalidFileType`;
        }
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > FileUtil.MAX_FILE_SIZE_MB) {
            return `validation.fileTooLarge`;
        }
        return null;
    }

    /**
     * Resizes an image for mobile display (max 1080px on longest side, preserving aspect ratio).
     * Iteratively reduces JPEG quality until output is within the configured target size.
     */
    static resizeForMobile(file: File): Promise<File> {
        return FileUtil._resizeContain(file, AppConfig.UPLOAD_IMG_MAX_PX, AppConfig.UPLOAD_IMG_QUALITY, AppConfig.UPLOAD_IMG_TARGET_OUTPUT_SIZE_BYTES);
    }

    /**
     * Center-crops an image to a square and resizes to the given size.
     * Used for avatars and square thumbnails.
     */
    static resizeAndCropSquare(file: File, size: number, quality = 0.9): Promise<File> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                canvas.width = size;
                canvas.height = size;

                const side = Math.min(img.width, img.height);
                const offsetX = (img.width - side) / 2;
                const offsetY = (img.height - side) / 2;

                ctx.drawImage(img, offsetX, offsetY, side, side, 0, 0, size, size);
                URL.revokeObjectURL(objectUrl);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) { reject(new Error('Could not create blob')); return; }
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    },
                    'image/jpeg',
                    quality,
                );
            };

            img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not load image')); };
            img.src = objectUrl;
        });
    }

    private static _resizeContain(file: File, maxPx: number, quality: number, targetBytes?: number): Promise<File> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
                const width = Math.round(img.width * scale);
                const height = Math.round(img.height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                URL.revokeObjectURL(objectUrl);

                if (targetBytes !== undefined) {
                    FileUtil._encodeToTargetSize(canvas, file.name, quality, targetBytes)
                        .then(resolve)
                        .catch(reject);
                } else {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) { reject(new Error('Could not create blob')); return; }
                            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                        },
                        'image/jpeg',
                        quality,
                    );
                }
            };

            img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not load image')); };
            img.src = objectUrl;
        });
    }

    // Iteratively lowers JPEG quality (step 0.05) until the blob fits within targetBytes.
    // Stops at quality 0.1 to avoid visually unacceptable results.
    private static async _encodeToTargetSize(canvas: HTMLCanvasElement, fileName: string, initialQuality: number, targetBytes: number): Promise<File> {
        const toBlob = (q: number) => new Promise<Blob>((res, rej) =>
            canvas.toBlob(blob => blob ? res(blob) : rej(new Error('toBlob failed')), 'image/jpeg', q)
        );

        let quality = initialQuality;
        let blob = await toBlob(quality);

        while (blob.size > targetBytes && quality > 0.1) {
            quality = Math.max(0.1, parseFloat((quality - 0.05).toFixed(2)));
            blob = await toBlob(quality);
        }

        return new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });
    }
}
