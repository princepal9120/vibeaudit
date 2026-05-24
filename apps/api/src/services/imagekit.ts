import { config } from '../config.js';

interface UploadResult {
    fileId: string;
    url: string;
    thumbnailUrl: string;
    name: string;
    size: number;
}

interface ImageKitError {
    message: string;
    help?: string;
}

/**
 * ImageKit service for uploading and managing files (PDFs, images, etc.)
 */
class ImageKitService {
    private urlEndpoint: string;
    private publicKey: string;
    private privateKey: string;

    constructor() {
        this.urlEndpoint = config.imagekitUrlEndpoint;
        this.publicKey = config.imagekitPublicKey;
        this.privateKey = config.imagekitPrivateKey;
    }

    /**
     * Check if ImageKit is configured
     */
    isConfigured(): boolean {
        return !!(this.urlEndpoint && this.publicKey && this.privateKey);
    }

    /**
     * Get base64 encoded auth header
     */
    private getAuthHeader(): string {
        const credentials = `${this.privateKey}:`;
        return `Basic ${Buffer.from(credentials).toString('base64')}`;
    }

    /**
     * Upload a file buffer to ImageKit
     * @param buffer - File buffer to upload
     * @param fileName - Name for the file
     * @param folder - Optional folder path in ImageKit
     */
    async upload(
        buffer: Buffer,
        fileName: string,
        folder: string = '/reports'
    ): Promise<UploadResult> {
        if (!this.isConfigured()) {
            throw new Error('ImageKit is not configured. Please set IMAGEKIT_* environment variables.');
        }

        const formData = new FormData();

        // Convert Buffer to Blob for FormData
        const blob = new Blob([buffer], { type: 'application/pdf' });
        formData.append('file', blob, fileName);
        formData.append('fileName', fileName);
        formData.append('folder', folder);
        formData.append('useUniqueFileName', 'true');

        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json() as ImageKitError;
            throw new Error(`ImageKit upload failed: ${error.message || response.statusText}`);
        }

        const result = await response.json() as UploadResult;
        return {
            fileId: result.fileId,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            name: result.name,
            size: result.size,
        };
    }

    /**
     * Delete a file from ImageKit
     * @param fileId - The ImageKit file ID to delete
     */
    async delete(fileId: string): Promise<void> {
        if (!this.isConfigured()) {
            throw new Error('ImageKit is not configured.');
        }

        const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': this.getAuthHeader(),
            },
        });

        if (!response.ok && response.status !== 404) {
            const error = await response.json() as ImageKitError;
            throw new Error(`ImageKit delete failed: ${error.message || response.statusText}`);
        }
    }

    /**
     * Get file details from ImageKit
     * @param fileId - The ImageKit file ID
     */
    async getFileDetails(fileId: string): Promise<UploadResult | null> {
        if (!this.isConfigured()) {
            throw new Error('ImageKit is not configured.');
        }

        const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}/details`, {
            method: 'GET',
            headers: {
                'Authorization': this.getAuthHeader(),
            },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            const error = await response.json() as ImageKitError;
            throw new Error(`ImageKit getFileDetails failed: ${error.message || response.statusText}`);
        }

        return response.json() as Promise<UploadResult>;
    }
}

// Singleton instance
export const imagekit = new ImageKitService();
