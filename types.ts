

export enum ToolType {
  FormatConverter = 'Format Converter',
  Compressor = 'Image Compressor',
  Resizer = 'Image Resizer',
  Watermark = 'Watermark Maker',
  Crop = 'Crop Image',
  JpgToPdf = 'JPG to PDF',
  PdfToJpg = 'PDF to JPG',
  PdfToPng = 'PDF to PNG',
  PdfToWord = 'PDF to Word',
  ImageToHtml = 'Image to HTML',
  HtmlToImage = 'HTML to Image',
  WallArtResizer = 'Wall Art Resizer',
}

export interface ProcessedFile {
  id: string;
  originalName: string;
  name: string;
  type: string;
  url: string; // Blob URL or Data URL
  size: number;
  originalSize?: number;
  preview?: string;
}

export interface ToolConfig {
  id: ToolType;
  slug: string; // SEO friendly URL slug
  description: string;
  icon: string; // Icon name
  accepts: string; // File input accept string
}

export interface BaseLayer {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  rotation: number; // degrees
  opacity: number; // 0-1
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string | number;
  fontStyle: string;
}

export interface DrawingLayer extends BaseLayer {
  type: 'drawing';
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle';
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface ImageOverlayLayer extends BaseLayer {
  type: 'image';
  src: string;
  width: number;
  height?: number;
}

export type EditorLayer = TextLayer | DrawingLayer | ShapeLayer | ImageOverlayLayer;