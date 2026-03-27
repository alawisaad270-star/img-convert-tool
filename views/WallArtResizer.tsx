

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, RefreshCw, Upload, Scissors, Target, Ruler, Lock, Check, ChevronDown, Image as ImageIcon, ZoomIn, Move, RotateCw, Crown, Key, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button, Input, Label, Badge } from '../components/UI';
import { ToolConfig } from '../types';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import AdUnit from '../components/AdUnit';

interface SizeConfig {
  id: string;
  width: number;
  height: number;
  label: string;
  type: string;
  folder: string;
  filename: string;
}

const SIZES: SizeConfig[] = [
  { id: '24x36', width: 24, height: 36, label: '24×36 in', type: 'Ratio 2:3', folder: '2-3_ratio', filename: '24x36' },
  { id: '20x30', width: 20, height: 30, label: '20×30 in', type: 'Ratio 2:3', folder: '2-3_ratio', filename: '20x30' },
  { id: '16x24', width: 16, height: 24, label: '16×24 in', type: 'Ratio 2:3', folder: '2-3_ratio', filename: '16x24' },
  { id: '12x18', width: 12, height: 18, label: '12×18 in', type: 'Ratio 2:3', folder: '2-3_ratio', filename: '12x18' },
  
  { id: '18x24', width: 18, height: 24, label: '18×24 in', type: 'Ratio 3:4', folder: '3-4_ratio', filename: '18x24' },
  { id: '15x20', width: 15, height: 20, label: '15×20 in', type: 'Ratio 3:4', folder: '3-4_ratio', filename: '15x20' },
  { id: '12x16', width: 12, height: 16, label: '12×16 in', type: 'Ratio 3:4', folder: '3-4_ratio', filename: '12x16' },
  
  { id: '16x20', width: 16, height: 20, label: '16×20 in', type: 'Ratio 4:5', folder: '4-5_ratio', filename: '16x20' },
  { id: '8x10', width: 8, height: 10, label: '8×10 in', type: 'Ratio 4:5', folder: '4-5_ratio', filename: '8x10' },
  
  { id: 'a1', width: 23.4, height: 33.1, label: 'A1 (23.4×33.1)', type: 'ISO Paper', folder: 'iso_paper', filename: 'a1' },
  { id: 'a2', width: 16.5, height: 23.4, label: 'A2 (16.5×23.4)', type: 'ISO Paper', folder: 'iso_paper', filename: 'a2' },
  { id: 'a3', width: 11.7, height: 16.5, label: 'A3 (11.7×16.5)', type: 'ISO Paper', folder: 'iso_paper', filename: 'a3' },
  { id: 'a4', width: 8.3, height: 11.7, label: 'A4 (8.3×11.7)', type: 'ISO Paper', folder: 'iso_paper', filename: 'a4' },
  
  { id: '5x7', width: 5, height: 7, label: '5×7 in', type: 'Standard', folder: 'standard', filename: '5x7' },
  { id: '11x14', width: 11, height: 14, label: '11×14 in', type: 'Standard', folder: 'standard', filename: '11x14' }
];

const GROUPED_SIZES = SIZES.reduce((acc, size) => {
  if (!acc[size.type]) acc[size.type] = [];
  acc[size.type].push(size);
  return acc;
}, {} as Record<string, SizeConfig[]>);

const PREMIUM_KEYS = ["A1B2C3D4E5F6", "Z9Y8X7W6V5U4", "M1N2O3P4Q5R6", "G7H8I9J0K1L2", "S3T4U5V6W7X8"];

interface WallArtResizerProps {
  tool: ToolConfig;
  onBack: () => void;
}

interface CropSettings {
  posX: number;
  posY: number;
  zoom: number;
  rotation: number;
}

// Default settings object
const DEFAULT_CROP_SETTINGS: CropSettings = {
  posX: 50,
  posY: 50,
  zoom: 80,
  rotation: 0
};

export const WallArtResizer: React.FC<WallArtResizerProps> = ({ tool, onBack }) => {
  // Premium State with Safe LocalStorage Access
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wallArtPremiumUnlocked') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [licenseKey, setLicenseKey] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [currentSizeId, setCurrentSizeId] = useState<string>('24x36');
  
  // Initialize crop settings immediately to prevent "undefined" access errors
  const [cropSettings, setCropSettings] = useState<Record<string, CropSettings>>(() => {
    const initialSettings: Record<string, CropSettings> = {};
    SIZES.forEach(size => {
      initialSettings[size.id] = { ...DEFAULT_CROP_SETTINGS };
    });
    return initialSettings;
  });

  const [filename, setFilename] = useState('art-prints');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-initialize settings function (for new uploads)
  const initializeCropSettings = () => {
    const initialSettings: Record<string, CropSettings> = {};
    SIZES.forEach(size => {
      initialSettings[size.id] = { ...DEFAULT_CROP_SETTINGS };
    });
    setCropSettings(initialSettings);
  };

  const handleUnlock = () => {
    if (PREMIUM_KEYS.includes(licenseKey.trim())) {
      setIsUnlocked(true);
      try {
        localStorage.setItem('wallArtPremiumUnlocked', 'true');
      } catch (e) {
        console.warn('Could not save unlock status to local storage');
      }
      setUnlockError(null);
    } else {
      setUnlockError('Invalid license key. Please check and try again.');
    }
  };

  // Update canvas preview
  useEffect(() => {
    if (!originalImage || !canvasRef.current || !cropSettings[currentSizeId]) return;

    const size = SIZES.find(s => s.id === currentSizeId);
    if (!size) return;

    const settings = cropSettings[currentSizeId];
    if (!settings) return; // Safeguard against undefined settings
    
    // Preview at lower DPI for performance but high enough for crisp look
    const previewDPI = 72; 
    const pixelWidth = Math.round(size.width * previewDPI);
    const pixelHeight = Math.round(size.height * previewDPI);

    const canvas = canvasRef.current;
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    const cropRegion = calculateCropRegion(
        originalImage.width,
        originalImage.height,
        pixelWidth,
        pixelHeight,
        settings
    );

    ctx.save();
    ctx.translate(pixelWidth / 2, pixelHeight / 2);
    ctx.rotate((settings.rotation * Math.PI) / 180);
    
    // Draw image with high quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    try {
      ctx.drawImage(
          originalImage,
          cropRegion.sx, cropRegion.sy, cropRegion.sw, cropRegion.sh,
          -pixelWidth / 2, -pixelHeight / 2, pixelWidth, pixelHeight
      );
    } catch (err) {
      console.error("Preview drawing failed", err);
    }
    ctx.restore();

  }, [originalImage, currentSizeId, cropSettings]);

  const calculateCropRegion = (imgWidth: number, imgHeight: number, targetWidth: number, targetHeight: number, settings: CropSettings) => {
    // Avoid division by zero
    if (imgHeight === 0 || targetHeight === 0) return { sx: 0, sy: 0, sw: 0, sh: 0 };

    const targetAspect = targetWidth / targetHeight;
    const imgAspect = imgWidth / imgHeight;
    
    let cropWidth, cropHeight;
    
    if (imgAspect > targetAspect) {
        cropHeight = imgHeight;
        cropWidth = imgHeight * targetAspect;
    } else {
        cropWidth = imgWidth;
        cropHeight = imgWidth / targetAspect;
    }
    
    const zoomFactor = settings.zoom / 100;
    cropWidth = cropWidth * zoomFactor;
    cropHeight = cropHeight * zoomFactor;
    
    cropWidth = Math.min(cropWidth, imgWidth);
    cropHeight = Math.min(cropHeight, imgHeight);
    
    const maxOffsetX = imgWidth - cropWidth;
    const maxOffsetY = imgHeight - cropHeight;
    
    const sx = maxOffsetX * (settings.posX / 100);
    const sy = maxOffsetY * (settings.posY / 100);
    
    return { sx, sy, sw: cropWidth, sh: cropHeight };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.match('image.*')) {
            showStatus('Please upload an image file.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setOriginalImage(img);
                setImageInfo({
                    width: img.width,
                    height: img.height,
                    size: (file.size / 1024 / 1024).toFixed(2)
                });
                
                const originalName = file.name.split('.')[0];
                setFilename(originalName);
                
                // Reset crops
                initializeCropSettings();
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
  };

  const updateSetting = (key: keyof CropSettings, value: number) => {
      setCropSettings(prev => {
          // Safeguard: Ensure the specific size setting exists
          const currentSettings = prev[currentSizeId] || { ...DEFAULT_CROP_SETTINGS };
          
          return {
              ...prev,
              [currentSizeId]: {
                  ...currentSettings,
                  [key]: value
              }
          };
      });
  };

  const showStatus = (text: string, type: 'success' | 'error') => {
      setStatusMessage({ text, type });
      setTimeout(() => setStatusMessage(null), 4000);
  };

  const dataURLToBlob = (dataURL: string) => {
    if (!dataURL || dataURL.length < 22) return null; // Safety check

    try {
        const parts = dataURL.split(';base64,');
        if (parts.length < 2) return null;
        
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    } catch (e) {
        console.error("Blob conversion failed", e);
        return null;
    }
  };

  const processImages = async () => {
      if (!originalImage) return;
      setIsProcessing(true);

      try {
          const zip = new JSZip();
          // REDUCED DPI TO PREVENT CRASHES
          // 150 DPI is standard for high quality digital downloads and safer for browser memory
          const EXPORT_DPI = 150; 

          for (const size of SIZES) {
              const settings = cropSettings[size.id];
              if (!settings) continue; // Skip if settings invalid

              // Allow UI updates so page doesn't freeze
              await new Promise(resolve => setTimeout(resolve, 10));

              try {
                  const pixelWidth = Math.round(size.width * EXPORT_DPI);
                  const pixelHeight = Math.round(size.height * EXPORT_DPI);

                  const canvas = document.createElement('canvas');
                  canvas.width = pixelWidth;
                  canvas.height = pixelHeight;
                  const ctx = canvas.getContext('2d');
                  
                  if (!ctx) continue;

                  ctx.fillStyle = 'white';
                  ctx.fillRect(0, 0, pixelWidth, pixelHeight);

                  const cropRegion = calculateCropRegion(
                      originalImage.width,
                      originalImage.height,
                      pixelWidth,
                      pixelHeight,
                      settings
                  );

                  ctx.save();
                  ctx.translate(pixelWidth / 2, pixelHeight / 2);
                  ctx.rotate((settings.rotation * Math.PI) / 180);
                  
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';

                  ctx.drawImage(
                      originalImage,
                      cropRegion.sx, cropRegion.sy, cropRegion.sw, cropRegion.sh,
                      -pixelWidth / 2, -pixelHeight / 2, pixelWidth, pixelHeight
                  );
                  ctx.restore();

                  const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.90);
                  if (!jpgDataUrl || jpgDataUrl === 'data:,') {
                      console.warn(`Skipping ${size.id}: Canvas export failed`);
                      continue;
                  }

                  const jpgBlob = dataURLToBlob(jpgDataUrl);
                  if (!jpgBlob) {
                      console.warn(`Skipping ${size.id}: Blob creation failed`);
                      continue;
                  }
                  
                  zip.file(`${size.folder}/${size.filename}.jpg`, jpgBlob);

                  // PDF
                  try {
                      const pdf = new jsPDF({
                          orientation: size.width > size.height ? 'landscape' : 'portrait',
                          unit: 'in',
                          format: [size.width, size.height]
                      });

                      pdf.addImage(jpgDataUrl, 'JPEG', 0, 0, size.width, size.height, undefined, 'FAST');
                      const pdfBlob = pdf.output('blob');
                      zip.file(`${size.folder}/${size.filename}.pdf`, pdfBlob);
                  } catch (pdfErr) {
                      console.error(`PDF generation failed for ${size.id}`, pdfErr);
                  }
              } catch (loopErr) {
                  console.error(`Error processing size ${size.id}`, loopErr);
                  // Continue to next size instead of crashing entire process
              }
          }

          const zipBlob = await zip.generateAsync({type: 'blob'});
          const downloadUrl = URL.createObjectURL(zipBlob);
          
          let safeFilename = filename.trim() || 'cropped-images';
          if (!safeFilename.toLowerCase().endsWith('.zip')) {
              safeFilename += '.zip';
          }

          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = safeFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);

          showStatus(`Successfully downloaded ${safeFilename}!`, 'success');

      } catch (error) {
          console.error(error);
          showStatus('An error occurred. Try smaller images or fewer sizes.', 'error');
      } finally {
          setIsProcessing(false);
      }
  };

  // Locked State View
  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
              <Crown className="w-10 h-10 text-amber-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Premium Tool</h2>
            <p className="text-slate-600">
              The Wall Art Resizer is a specialized studio for professionals. Please enter your premium license key to access this tool.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <Label className="mb-2">License Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="pl-10 font-mono text-center uppercase tracking-widest"
                />
              </div>
            </div>

            {unlockError && (
              <div className="flex items-start space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <Button onClick={handleUnlock} size="lg" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border-none shadow-lg shadow-amber-500/30 text-white">
              Unlock Access
            </Button>

            <Button variant="ghost" onClick={onBack} className="w-full text-slate-500">
              Go Back
            </Button>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center space-x-4 text-xs text-slate-400">
            <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Secure Access</span>
            <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> Lifetime Updates</span>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked / Normal View
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen bg-slate-100 overflow-hidden">
      
      {/* Header - Desktop */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 h-16 shadow-sm z-20">
          <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="hidden sm:flex text-slate-500 hover:text-slate-900">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </Button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                      <Scissors className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Wall Art Resizer Studio</h2>
                  <Badge type="warning">Premium</Badge>
              </div>
          </div>
          
          {originalImage && (
             <div className="flex items-center space-x-3">
                 <div className="hidden md:flex items-center px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-xs text-slate-500">
                    <span className="font-medium text-slate-700 mr-2">{imageInfo?.width} × {imageInfo?.height}px</span>
                    <span>{imageInfo?.size} MB</span>
                 </div>
                 <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Replace Image
                 </Button>
             </div>
          )}
      </div>

      <div className="flex-1 flex overflow-hidden">
          
          {/* Main Workspace (Canvas) */}
          <div className="flex-1 bg-slate-200/50 relative flex flex-col items-center justify-center p-8 overflow-hidden">
              {/* Dot Pattern Background */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              {!originalImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative z-10 w-full max-w-lg bg-white border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center hover:border-primary hover:bg-primary/5 hover:scale-[1.01] transition-all cursor-pointer shadow-xl shadow-slate-200/50"
                  >
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload your Artwork</h3>
                      <p className="text-slate-500 mb-8">Supports High-Res JPG, PNG (Max 50MB)</p>
                      <Button size="lg" className="w-full">Select Image</Button>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                  </div>
              ) : (
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                       {/* Canvas Container with Shadow */}
                       <div className="relative shadow-2xl shadow-slate-400/20 bg-white ring-8 ring-white rounded-sm overflow-hidden" style={{ maxHeight: 'calc(100vh - 180px)', maxWidth: 'calc(100% - 64px)' }}>
                           <canvas 
                            ref={canvasRef} 
                            className="block max-w-full max-h-full w-auto h-auto object-contain"
                            style={{ imageRendering: 'high-quality' as any }}
                           ></canvas>
                       </div>
                       
                       {/* Canvas Footer Info */}
                       <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-white/50">
                           <Badge type="info" >Preview Mode</Badge>
                           <span className="text-sm font-medium text-slate-600">
                              {SIZES.find(s => s.id === currentSizeId)?.label}
                           </span>
                           <span className="text-slate-300">|</span>
                           <span className="text-xs text-slate-500">
                               Crop Quality: 150 DPI
                           </span>
                       </div>
                  </div>
              )}
          </div>

          {/* Right Sidebar - Controls (Fixed Width) */}
          <div className={`w-[360px] bg-white border-l border-slate-200 flex flex-col shrink-0 transition-transform duration-300 z-30 ${!originalImage ? 'translate-x-full hidden lg:flex lg:translate-x-0 lg:opacity-50 pointer-events-none' : ''}`}>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* Section 1: Output Name */}
                  <div className="p-6 border-b border-slate-100">
                      <Label className="mb-2">Project Name</Label>
                      <div className="relative">
                          <Input 
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className="pr-12 font-medium"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">.ZIP</span>
                      </div>
                  </div>

                  {/* Section 2: Size Selection */}
                  <div className="p-6 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                          <Label>Select Size to Adjust</Label>
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {SIZES.length} outputs
                          </span>
                      </div>
                      
                      <div className="space-y-6">
                          {Object.entries(GROUPED_SIZES).map(([groupName, sizes]) => (
                              <div key={groupName}>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                                      {groupName}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2">
                                      {sizes.map(size => (
                                          <button
                                            key={size.id}
                                            onClick={() => setCurrentSizeId(size.id)}
                                            className={`relative flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-200 ${
                                                currentSizeId === size.id 
                                                ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary ring-offset-1' 
                                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/30 hover:bg-white'
                                            }`}
                                          >
                                              <span className="text-sm font-bold">{size.label}</span>
                                              <span className={`text-[10px] mt-0.5 ${currentSizeId === size.id ? 'text-primary-foreground/80' : 'text-slate-400'}`}>
                                                  {size.width}" x {size.height}"
                                              </span>
                                              {currentSizeId === size.id && (
                                                  <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                                              )}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Section 3: Adjustments */}
                  <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                          <Label>Crop & Position</Label>
                          <button 
                            onClick={() => {
                                updateSetting('rotation', 0);
                                updateSetting('zoom', 80);
                                updateSetting('posX', 50);
                                updateSetting('posY', 50);
                            }}
                            className="text-xs text-slate-500 hover:text-primary underline"
                          >
                              Reset Crop
                          </button>
                      </div>

                      <div className="space-y-5">
                          {/* Zoom Control */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center text-sm font-medium text-slate-700">
                                      <ZoomIn className="w-4 h-4 mr-2 text-slate-400" /> Zoom
                                  </div>
                                  <span className="text-xs font-bold text-primary bg-white px-2 py-0.5 rounded border border-slate-200">
                                      {cropSettings[currentSizeId]?.zoom}%
                                  </span>
                              </div>
                              <input 
                                type="range" min="10" max="100" 
                                value={cropSettings[currentSizeId]?.zoom || 80} 
                                onChange={(e) => updateSetting('zoom', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                          </div>

                          {/* Position Controls */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div className="flex items-center text-sm font-medium text-slate-700 mb-3">
                                  <Move className="w-4 h-4 mr-2 text-slate-400" /> Position
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <span className="text-xs text-slate-400 mb-1 block">Horizontal</span>
                                      <input 
                                        type="range" min="0" max="100" 
                                        value={cropSettings[currentSizeId]?.posX || 50} 
                                        onChange={(e) => updateSetting('posX', parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                      />
                                  </div>
                                  <div>
                                      <span className="text-xs text-slate-400 mb-1 block">Vertical</span>
                                      <input 
                                        type="range" min="0" max="100" 
                                        value={cropSettings[currentSizeId]?.posY || 50} 
                                        onChange={(e) => updateSetting('posY', parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                      />
                                  </div>
                              </div>
                          </div>

                          {/* Rotation */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center text-sm font-medium text-slate-700">
                                      <RotateCw className="w-4 h-4 mr-2 text-slate-400" /> Rotate
                                  </div>
                                  <span className="text-xs font-bold text-primary bg-white px-2 py-0.5 rounded border border-slate-200">
                                      {cropSettings[currentSizeId]?.rotation}°
                                  </span>
                              </div>
                              <input 
                                type="range" min="-45" max="45" 
                                value={cropSettings[currentSizeId]?.rotation || 0} 
                                onChange={(e) => updateSetting('rotation', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Bottom Actions (Fixed) */}
              <div className="p-5 border-t border-slate-200 bg-white">
                  <Button 
                    size="lg" 
                    className="w-full h-12 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" 
                    onClick={processImages} 
                    disabled={isProcessing} 
                    isLoading={isProcessing}
                  >
                      {!isProcessing && <Download className="w-5 h-5 mr-2" />}
                      Download All Files
                  </Button>
                  <p className="text-center text-xs text-slate-400 mt-3">
                      Generates high-res JPG & PDF for all {SIZES.length} sizes
                  </p>

                  {/* Ad Unit in Sidebar */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <AdUnit 
                      slot="1082532822" 
                      format="auto" 
                      responsive="true" 
                    />
                  </div>
              </div>
          </div>
      </div>

      {/* Status Toast */}
      {statusMessage && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-4 z-50 ${
              statusMessage.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
          }`}>
              <span className="text-xl">{statusMessage.type === 'success' ? '🎉' : '⚠️'}</span>
              <span className="font-medium">{statusMessage.text}</span>
          </div>
      )}
    </div>
  );
};