
import { ProcessedFile } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const readFileAsDataURL = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file data."));
    reader.readAsDataURL(file);
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for network URLs to avoid tainting issues with data URIs in some browsers
    if (!src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image from source."));
    img.src = src;
  });
};

export interface WatermarkConfig {
  type: 'text' | 'image';
  text?: string;
  image?: HTMLImageElement;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  opacity: number; // 0-1
  rotation: number; // degrees
  scale: number; // 0.1 - 5
  color?: string;
  fontSize?: number; // relative base size
}

export interface ImageAdjustments {
    brightness?: number; // 100
    contrast?: number; // 100
    saturation?: number; // 100
    blur?: number; // 0
    grayscale?: number; // 0
    sepia?: number; // 0
    invert?: number; // 0
    flipX?: boolean;
    flipY?: boolean;
    rotation?: number;
}

// Core Image Processing Function
export const processImage = async (
  file: File | Blob,
  options: {
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0 to 1
    format?: string; // image/jpeg, image/png, image/webp
    watermark?: WatermarkConfig; // Updated from watermarkText
    crop?: { x: number; y: number; width: number; height: number };
    adjustments?: ImageAdjustments;
  }
): Promise<Blob> => {
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Handle Crop first if it exists
  if (options.crop) {
    const { x, y, width, height } = options.crop;
    canvas.width = width;
    canvas.height = height;
    
    // Draw only the cropped portion
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

  } else if (options.adjustments) {
      // Handle Image Adjustments (Rotation changes dimensions)
      const { rotation = 0, flipX, flipY } = options.adjustments;
      
      // Calculate new canvas dimensions based on rotation
      if (rotation % 180 !== 0) {
          canvas.width = img.height;
          canvas.height = img.width;
      } else {
          canvas.width = img.width;
          canvas.height = img.height;
      }

      ctx.save();
      
      // Move to center to rotate/scale
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

      // Apply Filters
      const { brightness = 100, contrast = 100, saturation = 100, blur = 0, grayscale = 0, sepia = 0, invert = 0 } = options.adjustments;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%) invert(${invert}%)`;

      // Draw centered
      // Note: when rotated 90deg, dimensions are swapped in canvas but img is drawn relative to its original axis
      // which is now rotated.
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      ctx.restore();

  } else {
    // Handle Resizing or Default Dimensions
    let targetWidth = options.width || img.width;
    let targetHeight = options.height || img.height;

    // Smart Resize (Max Dimensions) - Only scale down
    if (options.maxWidth || options.maxHeight) {
        const ratio = img.width / img.height;
        
        if (options.maxWidth && targetWidth > options.maxWidth) {
            targetWidth = options.maxWidth;
            targetHeight = targetWidth / ratio;
        }
        
        if (options.maxHeight && targetHeight > options.maxHeight) {
            targetHeight = options.maxHeight;
            targetWidth = targetHeight * ratio;
        }
    } else {
        // Explicit Resize Logic
        if (options.width && !options.height) {
            targetHeight = (img.height / img.width) * options.width;
        } else if (!options.width && options.height) {
            targetWidth = (img.width / img.height) * options.height;
        }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  }

  // Handle Watermark (Applied after crop/resize/adjust)
  if (options.watermark) {
    const { type, text, image, x, y, opacity, rotation, scale, color } = options.watermark;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.save();
    
    // Position (convert percentage to pixels)
    const posX = (x / 100) * w;
    const posY = (y / 100) * h;
    
    ctx.translate(posX, posY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.globalAlpha = opacity;

    if (type === 'text' && text) {
        // Text Watermark
        const baseFontSize = Math.min(w, h) * 0.05; // 5% of smallest dimension as base
        const finalFontSize = baseFontSize * scale * 5; // Scale multiplier matches UI feeling
        
        ctx.font = `bold ${finalFontSize}px sans-serif`;
        ctx.fillStyle = color || 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Shadow for better visibility
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(text, 0, 0);
        
        // Optional Stroke if white text
        if (color === '#ffffff' || color === 'white') {
           ctx.shadowColor = 'transparent';
           ctx.strokeStyle = 'rgba(0,0,0,0.3)';
           ctx.lineWidth = finalFontSize / 25;
           ctx.strokeText(text, 0, 0);
        }

    } else if (type === 'image' && image) {
        // Image Watermark
        // Standardize: Base width is 20% of canvas width
        const baseWidth = w * 0.2; 
        const aspect = image.width / image.height;
        
        // Apply user scale
        const drawWidth = baseWidth * scale; 
        const drawHeight = drawWidth / aspect;
        
        // Draw centered at origin (which is already translated to x,y)
        ctx.drawImage(image, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
    }
    
    ctx.restore();
  }

  const mimeType = options.format || file.type;
  const quality = options.quality !== undefined ? options.quality : 0.9;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      },
      mimeType,
      quality
    );
  });
};

export const generateHtmlSnippet = (file: ProcessedFile): string => {
  return `<img src="${file.url}" alt="${file.originalName}" style="max-width: 100%; height: auto;" />`;
};
