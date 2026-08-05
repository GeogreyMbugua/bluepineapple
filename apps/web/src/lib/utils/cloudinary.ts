import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

function getCloudinaryConfig() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) {
    throw new Error('CLOUDINARY_URL is not set');
  }
  return url;
}

export async function uploadToCloudinary(file: File | Buffer, folder = 'blue-pineapple'): Promise<UploadResult> {
  getCloudinaryConfig();
  cloudinary.config();

  let buffer: Buffer;

  if (file instanceof File) {
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    buffer = file;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        } else {
          reject(new Error('Upload failed: no result'));
        }
      }
    );

    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  getCloudinaryConfig();
  cloudinary.config();
  await cloudinary.uploader.destroy(publicId);
}
