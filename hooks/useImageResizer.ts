import { useCallback } from 'react';
import { Dimensions } from '../types';

export const useImageResizer = () => {
  const resizeImage = useCallback((file: File, targetDimensions: Dimensions): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        if (!event.target?.result || typeof event.target.result !== 'string') {
            return reject(new Error('Failed to read file.'));
        }
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetDimensions.width;
          canvas.height = targetDimensions.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return reject(new Error('Could not get canvas context.'));
          }

          const targetAspectRatio = targetDimensions.width / targetDimensions.height;
          const originalAspectRatio = img.width / img.height;

          let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

          if (originalAspectRatio > targetAspectRatio) {
            // Original is wider than target, crop width
            sourceWidth = img.height * targetAspectRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else if (originalAspectRatio < targetAspectRatio) {
            // Original is taller than target, crop height
            sourceHeight = img.width / targetAspectRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetDimensions.width, targetDimensions.height);
          
          resolve(canvas.toDataURL(file.type));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  }, []);

  const scaleImage = useCallback((imageUrl: string, targetDimensions: Dimensions): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageUrl;
        img.crossOrigin = "anonymous"; // Handle potential CORS issues with data URIs from different origins
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetDimensions.width;
            canvas.height = targetDimensions.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Could not get canvas context.'));
            }

            ctx.drawImage(img, 0, 0, targetDimensions.width, targetDimensions.height);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (error) => reject(error);
    });
  }, []);

  return { resizeImage, scaleImage };
};
