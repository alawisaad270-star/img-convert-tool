

import React, { useState, useCallback, useRef, useEffect, useReducer } from 'react';
import { ArrowLeft, Upload, FileText, Download, X, Copy, Check, FileType, Image as ImageIcon, Scissors, Settings, Save, RefreshCw, ChevronRight, TrendingDown, SlidersHorizontal, Target, Stamp, Type, MousePointer2, CheckCircle, Clock, Loader2, AlertCircle, Lock, Unlock, ShieldCheck, Zap, Globe, Layers, Maximize2, Wand2, Sliders, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Palette, Trash2, Plus, Layout, Brush, Square, Circle, Triangle, Sticker, Undo2, Redo2, ZoomIn, ZoomOut, Move, Crop } from 'lucide-react';
import { ToolType, ToolConfig, ProcessedFile } from '../types';
import { Button, Card, Label, Input, Select, Badge, Tabs, Tab } from '../components/UI';
import { processImage, formatFileSize, generateHtmlSnippet, readFileAsDataURL, loadImage } from '../utils/fileUtils';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
// import * as pdfjsLib from 'pdfjs-dist'; // Dynamic import used instead
import { VisualCropper } from '../components/VisualCropper';
import { VisualWatermark } from '../components/VisualWatermark';
import imageCompression from 'browser-image-compression';
import html2canvas from 'html2canvas';
import { WallArtResizer } from './WallArtResizer';
import AdUnit from '../components/AdUnit';

// Helper to load PDF.js dynamically
const getPdfJs = async () => {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
  return pdfjsLib;
};

interface ToolWorkspaceProps {
  tool: ToolConfig;
  onBack: () => void;
}

const MIME_TYPE_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/avif': 'avif',
  'image/tiff': 'tiff',
  'application/pdf': 'pdf',
  'text/html': 'html',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/svg+xml': 'svg',
  'text/plain': 'txt',
};

const FORMAT_TO_MIME: Record<string, string> = {
  'JPG': 'image/jpeg',
  'JPEG': 'image/jpeg',
  'PNG': 'image/png',
  'WebP': 'image/webp',
  'GIF': 'image/gif',
  'BMP': 'image/bmp',
  'ICO': 'image/x-icon',
  'TIFF': 'image/tiff',
  'AVIF': 'image/avif',
  'SVG': 'image/svg+xml',
  'PDF': 'application/pdf',
  'DOC': 'application/msword',
  'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'WORD': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'TXT': 'text/plain',
  'TEXT': 'text/plain',
};

const FORMAT_CATEGORIES = {
  image: ['JPG', 'PNG', 'WebP', 'AVIF', 'PDF'],
  document: ['PDF', 'TXT', 'HTML', 'WORD']
};

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({ tool, onBack }) => {
  // If Wall Art Resizer is selected, render its specialized view directly
  if (tool.id === ToolType.WallArtResizer) {
    return <WallArtResizer tool={tool} onBack={onBack} />;
  }

  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [fileStatus, setFileStatus] = useState<('pending' | 'processing' | 'completed' | 'error')[]>([]);
  const [fileErrors, setFileErrors] = useState<(string | null)[]>([]);

  // Settings State
  const [format, setFormat] = useState('JPG');
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [imgAspectRatio, setImgAspectRatio] = useState<number | null>(null);

  // Format Converter Categories
  const [activeCategory, setActiveCategory] = useState<'image' | 'document'>('image');

  // Compressor State
  const [compressMode, setCompressMode] = useState<'manual' | 'auto'>('auto');
  const [targetSizeMB, setTargetSizeMB] = useState<number>(1);
  const [compressFormat, setCompressFormat] = useState<string>('original');
  const [compressProgress, setCompressProgress] = useState<number>(0);
  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');

  // Crop State
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cropAspectRatio, setCropAspectRatio] = useState<number | undefined>(undefined);

  // Watermark State
  const [wmType, setWmType] = useState<'text' | 'image'>('text');
  const [wmText, setWmText] = useState('Confidential');
  const [wmImage, setWmImage] = useState<HTMLImageElement | undefined>(undefined);
  const [wmOpacity, setWmOpacity] = useState(0.5);
  const [wmRotation, setWmRotation] = useState(0);
  const [wmScale, setWmScale] = useState(1);
  const [wmColor, setWmColor] = useState('#ffffff');
  const [wmPosition, setWmPosition] = useState({ x: 50, y: 50 });

  // PDF to Word State
  const [pdfWordMode, setPdfWordMode] = useState<'editable' | 'visual'>('editable');

  // HTML to Image State
  const [htmlInputMode, setHtmlInputMode] = useState<'file' | 'text'>('file');
  const [htmlCode, setHtmlCode] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wmFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Aspect Ratio
  useEffect(() => {
    if (files.length > 0 && tool.id === ToolType.Resizer) {
      const img = new Image();
      img.onload = () => {
        setImgAspectRatio(img.width / img.height);
        if (width === '' && height === '') {
            setWidth(img.width);
            setHeight(img.height);
        }
      };
      if (files[0].type.startsWith('image/')) {
        img.src = URL.createObjectURL(files[0]);
      }
    } else {
        setImgAspectRatio(null);
    }
  }, [files, tool.id]);

  useEffect(() => {
    if (tool.id === ToolType.PdfToJpg || tool.id === ToolType.HtmlToImage) {
        setFormat('JPG');
    } else if (tool.id === ToolType.PdfToPng) {
        setFormat('PNG');
    }
  }, [tool.id]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
      setFileStatus(prev => [...prev, ...droppedFiles.map(() => 'pending' as const)]);
      setFileErrors(prev => [...prev, ...droppedFiles.map(() => null)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setFileStatus(prev => [...prev, ...newFiles.map(() => 'pending' as const)]);
      setFileErrors(prev => [...prev, ...newFiles.map(() => null)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileStatus(prev => prev.filter((_, i) => i !== index));
    setFileErrors(prev => prev.filter((_, i) => i !== index));
  };

  const handleWidthChange = (val: number | '') => {
      setWidth(val);
      if (maintainAspectRatio && imgAspectRatio && val !== '') {
          setHeight(Math.round(val / imgAspectRatio));
      }
  };

  const handleHeightChange = (val: number | '') => {
      setHeight(val);
      if (maintainAspectRatio && imgAspectRatio && val !== '') {
          setWidth(Math.round(val * imgAspectRatio));
      }
  };

  const processFiles = async () => {
     setIsProcessing(true);
     setError(null);
     try {
         const results: ProcessedFile[] = [];
         
         if (tool.id === ToolType.JpgToPdf) {
             const pdf = new jsPDF();
             for (let i = 0; i < files.length; i++) {
                 const file = files[i];
                 const dataUrl = await readFileAsDataURL(file);
                 const img = await loadImage(dataUrl);
                 
                 if (i > 0) pdf.addPage();
                 
                 const pdfWidth = pdf.internal.pageSize.getWidth();
                 const pdfHeight = pdf.internal.pageSize.getHeight();
                 const ratio = img.width / img.height;
                 let drawWidth = pdfWidth;
                 let drawHeight = pdfWidth / ratio;
                 
                 if (drawHeight > pdfHeight) {
                     drawHeight = pdfHeight;
                     drawWidth = pdfHeight * ratio;
                 }
                 
                 pdf.addImage(dataUrl, 'JPEG', (pdfWidth - drawWidth) / 2, (pdfHeight - drawHeight) / 2, drawWidth, drawHeight);
             }
             const blob = pdf.output('blob');
             results.push({
                 id: Math.random().toString(),
                 originalName: 'combined.pdf',
                 name: 'converted.pdf',
                 type: 'application/pdf',
                 url: URL.createObjectURL(blob),
                 size: blob.size
             });
         } else if (tool.id === ToolType.PdfToJpg || tool.id === ToolType.PdfToPng) {
             const pdfjs = await getPdfJs();
             for (const file of files) {
                 const arrayBuffer = await file.arrayBuffer();
                 const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                 
                 for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                     const page = await pdf.getPage(pageNum);
                     const viewport = page.getViewport({ scale: 3 });
                     const canvas = document.createElement('canvas');
                     const context = canvas.getContext('2d');
                     if (!context) continue;
                     
                     canvas.height = viewport.height;
                     canvas.width = viewport.width;
                     
                     await page.render({ canvasContext: context, viewport }).promise;
                     
                     const outFormat = tool.id === ToolType.PdfToPng ? 'image/png' : 'image/jpeg';
                     const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), outFormat, 0.9));
                     
                     results.push({
                         id: Math.random().toString(),
                         originalName: `${file.name}_page_${pageNum}`,
                         name: `${file.name.split('.')[0]}_page_${pageNum}.${outFormat === 'image/png' ? 'png' : 'jpg'}`,
                         type: outFormat,
                         url: URL.createObjectURL(blob),
                         size: blob.size
                     });
                 }
             }
         } else if (tool.id === ToolType.HtmlToImage) {
             const container = document.createElement('div');
             container.style.position = 'absolute';
             container.style.left = '-9999px';
             container.style.top = '0';
             container.style.width = '1200px';
             
             if (htmlInputMode === 'text') {
                 container.innerHTML = htmlCode;
             } else {
                 const text = await files[0].text();
                 container.innerHTML = text;
             }
             
             document.body.appendChild(container);
             // Wait a bit for any resources to load
             await new Promise(resolve => setTimeout(resolve, 500));
             const canvas = await html2canvas(container, {
                 scale: 2,
                 useCORS: true,
                 allowTaint: true
             });
             document.body.removeChild(container);
             
             const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/png'));
             results.push({
                 id: Math.random().toString(),
                 originalName: 'html_capture.png',
                 name: 'html_capture.png',
                 type: 'image/png',
                 url: URL.createObjectURL(blob),
                 size: blob.size
             });
         } else if (tool.id === ToolType.ImageToHtml) {
             for (const file of files) {
                 const dataUrl = await readFileAsDataURL(file);
                 const html = `<!DOCTYPE html><html><head><title>${file.name}</title></head><body><img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; height: auto;" /></body></html>`;
                 const blob = new Blob([html], { type: 'text/html' });
                 results.push({
                     id: Math.random().toString(),
                     originalName: file.name,
                     name: `${file.name.split('.')[0]}.html`,
                     type: 'text/html',
                     url: URL.createObjectURL(blob),
                     size: blob.size
                 });
             }
         } else if (tool.id === ToolType.PdfToWord) {
             const pdfjs = await getPdfJs();
             for (const file of files) {
                 const arrayBuffer = await file.arrayBuffer();
                 const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                 
                 const sections = [];
                 for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                     const page = await pdf.getPage(pageNum);
                     const textContent = await page.getTextContent();
                     const pageText = textContent.items.map((item: any) => item.str).join(' ');
                     
                     sections.push({
                         properties: {},
                         children: [
                             new Paragraph({
                                 children: [
                                     new TextRun({
                                         text: `--- Page ${pageNum} ---`,
                                         bold: true,
                                     }),
                                 ],
                             }),
                             new Paragraph({
                                 children: [
                                     new TextRun(pageText),
                                 ],
                             }),
                         ],
                     });
                 }
                 
                 const doc = new Document({
                     sections: sections
                 });

                 const blob = await Packer.toBlob(doc);
                 
                 results.push({
                     id: Math.random().toString(),
                     originalName: file.name,
                     name: `${file.name.split('.')[0]}.docx`,
                     type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                     url: URL.createObjectURL(blob),
                     size: blob.size
                 });
             }
         } else {
             for (let i = 0; i < files.length; i++) {
                 const file = files[i];
                 
                 // Handle PDF input in general tools (especially Format Converter)
                 if (file.type === 'application/pdf' && tool.id === ToolType.FormatConverter) {
                    const pdfjs = await getPdfJs();
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                    const targetMime = FORMAT_TO_MIME[format] || 'image/jpeg';

                    if (targetMime === 'text/plain') {
                        let fullText = '';
                        for (let p = 1; p <= pdf.numPages; p++) {
                            const page = await pdf.getPage(p);
                            const textContent = await page.getTextContent();
                            fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
                        }
                        const blob = new Blob([fullText], { type: 'text/plain' });
                        results.push({
                            id: Math.random().toString(),
                            originalName: file.name,
                            name: `${file.name.split('.')[0]}.txt`,
                            type: 'text/plain',
                            url: URL.createObjectURL(blob),
                            size: blob.size
                        });
                        continue;
                    }

                    if (targetMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                        const sections = [];
                        for (let p = 1; p <= pdf.numPages; p++) {
                            const page = await pdf.getPage(p);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map((item: any) => item.str).join(' ');
                            sections.push({
                                properties: {},
                                children: [
                                    new Paragraph({ children: [new TextRun({ text: `--- Page ${p} ---`, bold: true })] }),
                                    new Paragraph({ children: [new TextRun(pageText)] }),
                                ],
                            });
                        }
                        const doc = new Document({ sections });
                        const blob = await Packer.toBlob(doc);
                        results.push({
                            id: Math.random().toString(),
                            originalName: file.name,
                            name: `${file.name.split('.')[0]}.docx`,
                            type: targetMime,
                            url: URL.createObjectURL(blob),
                            size: blob.size
                        });
                        continue;
                    }

                    // Convert PDF pages to images
                    for (let p = 1; p <= pdf.numPages; p++) {
                        const page = await pdf.getPage(p);
                        const viewport = page.getViewport({ scale: 3 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        if (!context) continue;
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        await page.render({ canvasContext: context, viewport }).promise;
                        
                        const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), targetMime, 0.9));
                        const ext = MIME_TYPE_MAP[blob.type] || 'jpg';
                        results.push({
                            id: Math.random().toString(),
                            originalName: `${file.name}_page_${p}`,
                            name: `${file.name.split('.')[0]}_page_${p}.${ext}`,
                            type: blob.type,
                            url: URL.createObjectURL(blob),
                            size: blob.size
                        });
                    }
                    continue;
                 }

                 // Handle TXT input in Format Converter
                 if (file.type === 'text/plain' && tool.id === ToolType.FormatConverter) {
                    const text = await file.text();
                    const targetMime = FORMAT_TO_MIME[format] || 'text/plain';

                    if (targetMime === 'application/pdf') {
                        const pdf = new jsPDF();
                        const splitText = pdf.splitTextToSize(text, 180);
                        pdf.text(splitText, 15, 15);
                        const blob = pdf.output('blob');
                        results.push({
                            id: Math.random().toString(),
                            originalName: file.name,
                            name: `${file.name.split('.')[0]}.pdf`,
                            type: 'application/pdf',
                            url: URL.createObjectURL(blob),
                            size: blob.size
                        });
                        continue;
                    }

                    if (targetMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                        const doc = new Document({
                            sections: [{
                                properties: {},
                                children: [new Paragraph({ children: [new TextRun(text)] })],
                            }],
                        });
                        const blob = await Packer.toBlob(doc);
                        results.push({
                            id: Math.random().toString(),
                            originalName: file.name,
                            name: `${file.name.split('.')[0]}.docx`,
                            type: targetMime,
                            url: URL.createObjectURL(blob),
                            size: blob.size
                        });
                        continue;
                    }
                    
                    if (targetMime === 'text/html') {
                        const html = `<!DOCTYPE html><html><head><title>${file.name}</title></head><body><pre>${text}</pre></body></html>`;
                        const blob = new Blob([html], { type: 'text/html' });
                        results.push({
                            id: Math.random().toString(),
                            originalName: file.name,
                            name: `${file.name.split('.')[0]}.html`,
                            type: 'text/html',
                            url: URL.createObjectURL(blob),
                            size: blob.size
                        });
                        continue;
                    }
                 }

                 // Handle HTML input in Format Converter
                 if (file.type === 'text/html' && tool.id === ToolType.FormatConverter) {
                    const html = await file.text();
                    const targetMime = FORMAT_TO_MIME[format] || 'text/html';

                    if (targetMime.startsWith('image/')) {
                        const container = document.createElement('div');
                        container.style.position = 'absolute';
                        container.style.left = '-9999px';
                        container.innerHTML = html;
                        document.body.appendChild(container);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const canvas = await html2canvas(container, { scale: 2 });
                        document.body.removeChild(container);
                        const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), targetMime, 0.9));
                        const ext = MIME_TYPE_MAP[blob.type] || 'jpg';
                        results.push({
                            id: Math.random().toString(),
                            originalName: file.name,
                            name: `${file.name.split('.')[0]}.${ext}`,
                            type: blob.type,
                            url: URL.createObjectURL(blob),
                            size: blob.size
                        });
                        continue;
                    }

                    if (targetMime === 'application/pdf') {
                        const container = document.createElement('div');
                        container.style.position = 'absolute';
                        container.style.left = '-9999px';
                        container.innerHTML = html;
                        document.body.appendChild(container);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const canvas = await html2canvas(container, { scale: 2 });
                        document.body.removeChild(container);
                        const imgData = canvas.toDataURL('image/jpeg', 0.9);
                        const pdf = new jsPDF(canvas.width > canvas.height ? 'l' : 'p', 'px', [canvas.width, canvas.height]);
                        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                        const blob = pdf.output('blob');
                        results.push({
                            id: Math.random().toString(),
                            originalName: file.name,
                            name: `${file.name.split('.')[0]}.pdf`,
                            type: 'application/pdf',
                            url: URL.createObjectURL(blob),
                            size: blob.size
                        });
                        continue;
                    }
                 }

                 let blob: Blob;

                 let targetMime = 'image/jpeg';
                 if (tool.id === ToolType.FormatConverter) {
                     targetMime = FORMAT_TO_MIME[format] || 'image/jpeg';
                 } else if (tool.id === ToolType.Compressor) {
                     targetMime = compressFormat === 'original' ? file.type : (FORMAT_TO_MIME[compressFormat.toUpperCase()] || 'image/jpeg');
                 } else {
                     targetMime = file.type;
                 }

                 // Special case for PDF output in Format Converter
                 if (targetMime === 'application/pdf') {
                    const dataUrl = await readFileAsDataURL(file);
                    const img = await loadImage(dataUrl);
                    const pdf = new jsPDF(img.width > img.height ? 'l' : 'p', 'px', [img.width, img.height]);
                    pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);
                    blob = pdf.output('blob');
                 } else if (targetMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    const dataUrl = await readFileAsDataURL(file);
                    const img = await loadImage(dataUrl);
                    
                    // Calculate dimensions to fit in Word (max width ~600px)
                    const maxWidth = 600;
                    const scale = Math.min(1, maxWidth / img.width);
                    const width = img.width * scale;
                    const height = img.height * scale;

                    const base64 = dataUrl.split(',')[1];
                    const binary = atob(base64);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }

                    const doc = new Document({
                        sections: [{
                            properties: {},
                            children: [
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: bytes,
                                            type: 'png',
                                            transformation: {
                                                width: width,
                                                height: height,
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }],
                    });
                    blob = await Packer.toBlob(doc);
                 } else if (targetMime === 'text/plain') {
                    const text = `Image Conversion Metadata:\nName: ${file.name}\nOriginal Type: ${file.type}\nOriginal Size: ${formatFileSize(file.size)}\nProcessed Date: ${new Date().toLocaleString()}`;
                    blob = new Blob([text], { type: 'text/plain' });
                 } else if (targetMime === 'text/html') {
                    const dataUrl = await readFileAsDataURL(file);
                    const html = `<!DOCTYPE html><html><head><title>${file.name}</title></head><body><img src="${dataUrl}" style="max-width:100%"/></body></html>`;
                    blob = new Blob([html], { type: 'text/html' });
                 } else if (tool.id === ToolType.Compressor && compressMode === 'auto') {
                     blob = await imageCompression(file, {
                         maxSizeMB: targetSizeMB,
                         maxWidthOrHeight: Number(resizeWidth) || undefined,
                         useWebWorker: true,
                         fileType: targetMime as any
                     });
                 } else {
                     blob = await processImage(file, {
                         width: Number(width) || undefined,
                         height: Number(height) || undefined,
                         quality: tool.id === ToolType.Compressor ? quality : 0.9,
                         format: targetMime,
                         crop: tool.id === ToolType.Crop && crop ? crop : undefined,
                         watermark: tool.id === ToolType.Watermark ? {
                             type: wmType, text: wmText, image: wmImage,
                             x: wmPosition.x, y: wmPosition.y, opacity: wmOpacity,
                             rotation: wmRotation, scale: wmScale, color: wmColor
                         } : undefined
                     });
                 }
                 
                 const ext = MIME_TYPE_MAP[blob.type] || 'jpg';
                 results.push({
                     id: Math.random().toString(),
                     originalName: file.name,
                     name: `${file.name.split('.')[0]}_processed.${ext}`,
                     type: blob.type,
                     url: URL.createObjectURL(blob),
                     size: blob.size
                 });
             }
         }
         setProcessedFiles(results);
     } catch (e: any) {
         console.error(e);
         setError(e.message || "An error occurred during processing.");
     } finally {
         setIsProcessing(false);
     }
  };

  const downloadAll = () => {
      if (processedFiles.length === 1) {
          const a = document.createElement('a');
          a.href = processedFiles[0].url;
          a.download = processedFiles[0].name;
          a.click();
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" onClick={onBack} size="sm" className="hidden sm:flex">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
             <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{tool.description}</h2>
            <p className="text-slate-500 text-sm hidden sm:block">Process your files securely in the browser</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {/* Drag Overlay */}
        {isDraggingOver && (
            <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-3xl flex items-center justify-center backdrop-blur-sm transition-all">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                    <Upload className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold text-primary">Drop files to upload</h3>
                </div>
            </div>
        )}

        {/* --- LEFT COLUMN: SETTINGS --- */}
        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            
            {/* HTML Input Tab */}
            {tool.id === ToolType.HtmlToImage && (
                <Card className="p-1">
                    <Tabs>
                        <Tab active={htmlInputMode === 'file'} onClick={() => setHtmlInputMode('file')}>Upload HTML File</Tab>
                        <Tab active={htmlInputMode === 'text'} onClick={() => setHtmlInputMode('text')}>Paste HTML Code</Tab>
                    </Tabs>
                </Card>
            )}

            {/* Editor Area for Visual Tools (Crop/Watermark Only) */}
            {(tool.id === ToolType.Crop || tool.id === ToolType.Watermark) && files.length > 0 && (
                <div className="bg-slate-100 rounded-2xl border border-slate-200 p-8 min-h-[500px] flex items-center justify-center shadow-inner relative overflow-hidden group">
                     {tool.id === ToolType.Crop ? (
                        <VisualCropper 
                            imageSrc={URL.createObjectURL(files[0])}
                            aspectRatio={cropAspectRatio}
                            onCropChange={setCrop}
                        />
                     ) : (
                        <VisualWatermark
                            imageSrc={URL.createObjectURL(files[0])}
                            config={{
                                type: wmType,
                                text: wmText,
                                imageSrc: wmImage ? wmImage.src : null,
                                x: wmPosition.x,
                                y: wmPosition.y,
                                opacity: wmOpacity,
                                rotation: wmRotation,
                                scale: wmScale,
                                color: wmColor
                            }}
                            onChange={(updates) => {
                                if (updates.x !== undefined || updates.y !== undefined) {
                                    setWmPosition(prev => ({ ...prev, ...updates }));
                                }
                            }}
                        />
                     )}
                </div>
            )}

            {/* HTML Code Editor */}
            {tool.id === ToolType.HtmlToImage && htmlInputMode === 'text' && (
                <div className="h-96">
                    <textarea 
                        className="w-full h-full p-4 font-mono text-sm bg-slate-900 text-slate-100 rounded-xl resize-none focus:ring-2 focus:ring-primary outline-none"
                        placeholder="<html><body><h1>Hello World</h1></body></html>"
                        value={htmlCode}
                        onChange={(e) => setHtmlCode(e.target.value)}
                    ></textarea>
                </div>
            )}

            {/* FORMAT CONVERTER SETTINGS */}
            {tool.id === ToolType.FormatConverter && (
              <Card className="min-h-[280px] flex flex-col">
                 <div className="mb-4">
                     <Label>Target Format</Label>
                 </div>
                 <div className="flex-1 flex gap-4 min-h-0">
                     {/* Categories */}
                     <div className="w-24 flex flex-col gap-1 border-r border-slate-100 pr-2">
                         {(Object.keys(FORMAT_CATEGORIES) as Array<keyof typeof FORMAT_CATEGORIES>).map(cat => (
                             <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-2 text-left text-sm font-medium rounded-lg flex items-center justify-between group ${activeCategory === cat ? 'bg-primary/5 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                             >
                                 <span className="capitalize">{cat}</span>
                                 {activeCategory === cat && <ChevronRight className="w-3 h-3" />}
                             </button>
                         ))}
                     </div>
                     {/* Grid */}
                     <div className="flex-1 overflow-y-auto pr-1">
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {FORMAT_CATEGORIES[activeCategory].map(fmt => (
                                 <button
                                    key={fmt}
                                    onClick={() => setFormat(fmt)}
                                    className={`px-2 py-3 text-sm font-medium rounded-lg border transition-all ${format === fmt ? 'bg-primary text-white border-primary shadow-md transform scale-105' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/30 hover:bg-white'}`}
                                 >
                                     {fmt}
                                 </button>
                             ))}
                         </div>
                     </div>
                 </div>
              </Card>
            )}

            {/* COMPRESSOR SETTINGS */}
            {tool.id === ToolType.Compressor && (
              <div className="space-y-4">
                  {/* Mode Selection */}
                  <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setCompressMode('manual')}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${compressMode === 'manual' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                      >
                          <div className="flex items-center space-x-2 mb-2">
                              <SlidersHorizontal className={`w-5 h-5 ${compressMode === 'manual' ? 'text-primary' : 'text-slate-400'}`} />
                              <span className={`font-bold ${compressMode === 'manual' ? 'text-slate-900' : 'text-slate-600'}`}>Manual Quality</span>
                          </div>
                          <p className="text-xs text-slate-500">Adjust compression level 0-100%</p>
                      </div>
                      <div 
                        onClick={() => setCompressMode('auto')}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${compressMode === 'auto' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                      >
                          <div className="flex items-center space-x-2 mb-2">
                              <Target className={`w-5 h-5 ${compressMode === 'auto' ? 'text-primary' : 'text-slate-400'}`} />
                              <span className={`font-bold ${compressMode === 'auto' ? 'text-slate-900' : 'text-slate-600'}`}>Target Size</span>
                          </div>
                          <p className="text-xs text-slate-500">Compress to a specific file size</p>
                      </div>
                  </div>

                  <Card className="space-y-6">
                      {compressMode === 'manual' ? (
                          <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                  <Label>Quality Level</Label>
                                  <Badge>{Math.round(quality * 100)}%</Badge>
                              </div>
                              <input 
                                type="range" 
                                min="0.1" 
                                max="1" 
                                step="0.05" 
                                value={quality}
                                onChange={(e) => setQuality(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                              <div className="flex justify-between text-xs text-slate-400 font-medium">
                                  <span>Smallest File</span>
                                  <span>Balanced</span>
                                  <span>Best Quality</span>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              <Label>Target File Size</Label>
                              <div className="flex items-center space-x-2 relative">
                                  <Input 
                                    type="number" 
                                    value={targetSizeMB}
                                    onChange={(e) => setTargetSizeMB(parseFloat(e.target.value))}
                                    step="0.1"
                                    min="0.1"
                                    className="pr-12"
                                  />
                                  <span className="absolute right-4 text-slate-500 font-medium text-sm top-3">MB</span>
                              </div>
                              <div className="flex gap-2">
                                  {[0.5, 1, 2, 5].map(size => (
                                      <button 
                                        key={size}
                                        onClick={() => setTargetSizeMB(size)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${targetSizeMB === size ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'}`}
                                      >
                                          {size}MB
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                          <div>
                              <Label className="text-xs uppercase text-slate-400">Output Format</Label>
                              <Select value={compressFormat} onChange={(e) => setCompressFormat(e.target.value)}>
                                  <option value="original">Same as Original</option>
                                  <option value="jpeg">JPEG</option>
                                  <option value="png">PNG</option>
                                  <option value="webp">WebP</option>
                              </Select>
                          </div>
                          <div>
                              <Label className="text-xs uppercase text-slate-400">Max Dimension (px)</Label>
                              <Input 
                                type="number" 
                                placeholder="Width (optional)" 
                                value={resizeWidth}
                                onChange={(e) => setResizeWidth(e.target.value ? Number(e.target.value) : '')}
                              />
                          </div>
                      </div>
                  </Card>
              </div>
            )}

            {/* WATERMARK SETTINGS */}
            {tool.id === ToolType.Watermark && (
                <Card className="space-y-6">
                    <Tabs>
                        <Tab active={wmType === 'text'} onClick={() => setWmType('text')}>Text Watermark</Tab>
                        <Tab active={wmType === 'image'} onClick={() => setWmType('image')}>Image Logo</Tab>
                    </Tabs>

                    {wmType === 'text' ? (
                        <div className="space-y-4">
                            <div>
                                <Label>Text Content</Label>
                                <Input value={wmText} onChange={(e) => setWmText(e.target.value)} placeholder="Enter text..." />
                            </div>
                            <div>
                                <Label>Color</Label>
                                <div className="flex items-center space-x-2">
                                    <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                                    <Input value={wmColor} onChange={(e) => setWmColor(e.target.value)} className="font-mono uppercase" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Label>Upload Logo</Label>
                            <input 
                                ref={wmFileInputRef}
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                     if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const img = new Image();
                                        img.onload = () => { setWmImage(img); setWmType('image'); };
                                        img.src = URL.createObjectURL(file);
                                    }
                                    if (wmFileInputRef.current) wmFileInputRef.current.value = '';
                                }}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                            />
                        </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs">Opacity</Label>
                                <input type="range" min="0.1" max="1" step="0.1" value={wmOpacity} onChange={(e) => setWmOpacity(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>
                            <div>
                                <Label className="text-xs">Scale</Label>
                                <input type="range" min="0.5" max="3" step="0.1" value={wmScale} onChange={(e) => setWmScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <Label className="text-xs">Rotation</Label>
                                <input type="range" min="0" max="360" value={wmRotation} onChange={(e) => setWmRotation(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100/50">
                             <div>
                                <Label className="text-xs">Position X</Label>
                                <input type="range" min="0" max="100" value={wmPosition.x} onChange={(e) => setWmPosition(p => ({...p, x: Number(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                             </div>
                             <div>
                                <Label className="text-xs">Position Y</Label>
                                <input type="range" min="0" max="100" value={wmPosition.y} onChange={(e) => setWmPosition(p => ({...p, y: Number(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                             </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* RESIZER SETTINGS */}
            {tool.id === ToolType.Resizer && (
                <Card className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <Label>New Dimensions</Label>
                         <button 
                            onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                            className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded transition-colors ${maintainAspectRatio ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}
                         >
                             {maintainAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                             <span>{maintainAspectRatio ? 'Ratio Locked' : 'Ratio Unlocked'}</span>
                         </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs text-slate-400">Width (px)</Label>
                            <Input type="number" value={width} onChange={(e) => handleWidthChange(e.target.value ? Number(e.target.value) : '')} placeholder="Width" />
                        </div>
                        <div>
                             <Label className="text-xs text-slate-400">Height (px)</Label>
                            <Input type="number" value={height} onChange={(e) => handleHeightChange(e.target.value ? Number(e.target.value) : '')} placeholder="Height" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <Label className="mb-2">Presets</Label>
                        <div className="flex flex-wrap gap-2">
                            {[0.25, 0.5, 0.75].map(scale => (
                                <button 
                                    key={scale}
                                    onClick={() => {
                                        if (files.length > 0) {
                                             const img = new Image();
                                             img.onload = () => {
                                                 handleWidthChange(Math.round(img.width * scale));
                                             };
                                             img.src = URL.createObjectURL(files[0]);
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs text-slate-600 transition-colors"
                                >
                                    {scale * 100}%
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

             {/* Action Button */}
             <div className="pt-4">
                 <Button 
                    onClick={processFiles} 
                    disabled={files.length === 0 || isProcessing} 
                    className="w-full py-4 text-lg shadow-xl shadow-primary/20"
                    size="lg"
                 >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Processing...
                        </>
                    ) : (
                        <>
                             <Zap className="w-5 h-5 mr-2 fill-current" /> {tool.id === ToolType.Compressor ? 'Compress Now' : 'Convert Now'}
                        </>
                    )}
                 </Button>
                 {error && (
                     <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start">
                         <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                         {error}
                     </div>
                 )}
             </div>

        </div>

        {/* --- RIGHT COLUMN: FILE LIST --- */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            {files.length === 0 ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver} 
                    onDragLeave={handleDragLeave} 
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 group ${isDraggingOver ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary hover:bg-slate-50'}`}
                >
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Upload className={`w-10 h-10 ${isDraggingOver ? 'text-primary' : 'text-slate-400'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Click or Drag files here</h3>
                    <p className="text-slate-500 mb-6">Supports JPG, PNG, WebP, PDF and more</p>
                    <Button variant="outline" className="pointer-events-none">Select Files</Button>
                </div>
            ) : (
                <div className="space-y-4">
                     <div className="flex items-center justify-between mb-2">
                         <h3 className="font-bold text-slate-900">Queue ({files.length})</h3>
                         <Button variant="ghost" size="sm" onClick={() => { setFiles([]); setProcessedFiles([]); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                             Clear All
                         </Button>
                     </div>
                     
                     {/* Processed Files List */}
                     {processedFiles.length > 0 && (
                         <div className="space-y-3 mb-6 animate-in slide-in-from-top-4">
                             {processedFiles.map((file) => (
                                 <div key={file.id} className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                     <div className="flex items-center space-x-4">
                                         <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border border-green-100">
                                            {file.type.includes('image') ? (
                                                <img src={file.url} alt="Result" className="w-10 h-10 object-cover rounded" />
                                            ) : (
                                                <FileText className="w-6 h-6 text-green-600" />
                                            )}
                                         </div>
                                         <div className="min-w-0">
                                             <p className="font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                             <p className="text-xs text-green-700">{formatFileSize(file.size)}</p>
                                         </div>
                                     </div>
                                     <a href={file.url} download={file.name} className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                         <Download className="w-4 h-4 mr-2" /> Download
                                     </a>
                                 </div>
                             ))}
                             {processedFiles.length > 1 && (
                                 <Button onClick={downloadAll} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                     <Download className="w-4 h-4 mr-2" /> Download All as ZIP
                                 </Button>
                             )}
                         </div>
                     )}

                     {/* Pending Files List */}
                     <div className="grid grid-cols-1 gap-3">
                         {files.map((file, idx) => (
                             <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center group hover:border-primary/50 transition-colors">
                                 <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
                                    {file.type.startsWith('image/') ? (
                                        <ImageIcon className="w-5 h-5 text-slate-500" />
                                    ) : (
                                        <FileText className="w-5 h-5 text-slate-500" />
                                    )}
                                 </div>
                                 <div className="flex-1 min-w-0 mr-4">
                                     <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                     <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                 </div>
                                 {fileStatus[idx] === 'processing' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                                 {fileStatus[idx] === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                 {fileStatus[idx] === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                 {fileStatus[idx] === 'pending' && (
                                     <button onClick={() => removeFile(idx)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                         <X className="w-4 h-4" />
                                     </button>
                                 )}
                             </div>
                         ))}
                     </div>
                </div>
            )}
            
            {/* Hidden Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                multiple 
                accept={tool.accepts} 
            />

            {/* Ad Unit at the bottom of workspace */}
            <div className="mt-12 pt-8 border-t border-slate-100">
                <AdUnit 
                    slot="9472158739" 
                    format="auto" 
                    responsive="true" 
                />
            </div>
        </div>

      </div>
    </div>
  );
};