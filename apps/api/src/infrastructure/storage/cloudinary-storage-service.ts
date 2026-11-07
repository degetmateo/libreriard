import { v2 as cloudinary } from 'cloudinary';
import { IStorageService, UploadResult } from './storage-service.interface';
import { EnvConfig } from '../config/env.config';
import crypto from 'crypto';

export class CloudinaryStorageService implements IStorageService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(
      EnvConfig.CLOUDINARY_CLOUD_NAME &&
      !EnvConfig.CLOUDINARY_CLOUD_NAME.includes('placeholder')
    );

    if (this.isConfigured) {
      cloudinary.config({
        cloud_name: EnvConfig.CLOUDINARY_CLOUD_NAME,
        api_key: EnvConfig.CLOUDINARY_API_KEY,
        api_secret: EnvConfig.CLOUDINARY_API_SECRET
      });
    }
  }

  public async uploadImage(buffer: Buffer, originalName: string): Promise<UploadResult> {
    if (!this.isConfigured) {
      const mockId = `mock_${crypto.randomBytes(8).toString('hex')}`;
      return {
        url: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60`,
        publicId: mockId
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'libreria-ruben-dario', resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Fallo al subir imagen a Cloudinary'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  public async deleteImage(publicId: string): Promise<void> {
    if (!this.isConfigured || publicId.startsWith('mock_')) return;
    await cloudinary.uploader.destroy(publicId);
  }
}
