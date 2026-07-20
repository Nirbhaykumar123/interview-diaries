import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Check if Cloudinary credentials are fully defined in the environment
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export class UploadService {
  /**
   * Processes a newly uploaded local avatar file.
   * If Cloudinary is configured, it will upload it to Cloudinary and delete the local temp file.
   * Otherwise, it keeps the local file and constructs a static serving URL.
   */
  async uploadAvatar(localFilePath: string, requestHost: string, protocol: string): Promise<string> {
    if (isCloudinaryConfigured) {
      try {
        const result = await cloudinary.uploader.upload(localFilePath, {
          folder: 'interview_diaries/avatars',
          transformation: [
            { width: 250, height: 250, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        });

        // Delete temporary file from local uploads dir
        try {
          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }
        } catch (err) {
          console.error('Failed to delete temporary local file after Cloudinary upload:', err);
        }

        return result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error, falling back to local file path:', error);
      }
    }

    // Default Fallback: serve locally
    const filename = path.basename(localFilePath);
    // Standardize URL protocol handling behind proxies
    const base = `${protocol}://${requestHost}`;
    return `${base}/uploads/${filename}`;
  }
}

export const uploadService = new UploadService();
