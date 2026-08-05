'use client';

import { useState, useCallback, useId } from 'react';

interface ImageUploadProps {
  onUpload: (url: string, publicId: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ImageUpload({
  onUpload,
  onError,
  accept = 'image/*',
  multiple = false,
  className = '',
  children,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputId = useId();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      setProgress(0);

      try {
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append('file', file);

          const xhr = new XMLHttpRequest();
          const result = await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setProgress(percent);
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                resolve(data.data);
              } else {
                let errorMessage = 'Upload failed';
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  errorMessage = errorData.error?.message || errorMessage;
                } catch {
                  // ignore parse error
                }
                reject(new Error(errorMessage));
              }
            });

            xhr.addEventListener('error', () => reject(new Error('Upload failed')));

            xhr.open('POST', '/api/admin/upload');
            xhr.send(formData);
          });

          onUpload(result.url, result.publicId);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        onError?.(message);
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [onUpload, onError]
  );

  return (
    <div className={className}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        id={inputId}
        disabled={isUploading}
      />
      <label
        htmlFor={inputId}
        className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
          isUploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-deep'
        }`}
      >
        {isUploading ? `Uploading... ${progress}%` : children || 'Upload Image'}
      </label>
    </div>
  );
}
