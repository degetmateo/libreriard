export interface UploadResult {
  url: string;
  publicId: string;
}

export interface IStorageService {
  uploadImage(buffer: Buffer, originalName: string): Promise<UploadResult>;
  deleteImage(publicId: string): Promise<void>;
}
