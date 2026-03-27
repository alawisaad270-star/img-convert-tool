import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VisualCropperProps {
  imageSrc: string;
  aspectRatio?: number; // width / height
  onCropChange: (crop: Crop) => void;
}

export const VisualCropper: React.FC<VisualCropperProps> = ({ imageSrc, aspectRatio, onCropChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Crop state in PERCENTAGES (0-100) to be responsive
  const [crop, setCrop] = useState<Crop>({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; crop: Crop }>({ x: 0, y: 0, crop: { x: 0, y: 0, width: 0, height: 0 } });

  // Initialize crop when image loads or aspect ratio changes
  useEffect(() => {
    if (aspectRatio && imageRef.current) {
      // Reset to a centered square/rect fitting the aspect ratio
      const { naturalWidth, naturalHeight } = imageRef.current;
      const imgAspect = naturalWidth / naturalHeight;
      
      let newW = 80;
      let newH = 80;
      
      if (aspectRatio > imgAspect) {
        // Wider than image: constrain by width
        newH = newW / aspectRatio * imgAspect;
      } else {
        // Taller than image: constrain by height
        newW = newH * aspectRatio / imgAspect;
      }
      
      const newCrop = {
        x: 50 - newW / 2,
        y: 50 - newH / 2,
        width: newW,
        height: newH
      };
      setCrop(newCrop);
    }
  }, [aspectRatio, imageSrc]);

  // Report crop changes in PIXELS
  useEffect(() => {
    if (imageRef.current && imageLoaded) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      onCropChange({
        x: Math.round((crop.x / 100) * naturalWidth),
        y: Math.round((crop.y / 100) * naturalHeight),
        width: Math.round((crop.width / 100) * naturalWidth),
        height: Math.round((crop.height / 100) * naturalHeight),
      });
    }
  }, [crop, onCropChange, imageLoaded]);

  const handlePointerDown = (e: React.PointerEvent, mode: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    
    // Capture pointer to handle moves outside the container
    (e.target as Element).setPointerCapture(e.pointerId);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !dragMode) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
    
    const start = dragStartRef.current.crop;
    let next = { ...start };

    // Apply constraints function
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

    if (dragMode === 'move') {
      next.x = clamp(start.x + deltaX, 0, 100 - start.width);
      next.y = clamp(start.y + deltaY, 0, 100 - start.height);
    } else {
      // Resizing logic
      if (dragMode.includes('n')) {
        next.y = clamp(start.y + deltaY, 0, start.y + start.height - 1); // Min 1% height
        next.height = start.height - (next.y - start.y);
      }
      if (dragMode.includes('s')) {
        next.height = clamp(start.height + deltaY, 1, 100 - start.y);
      }
      if (dragMode.includes('w')) {
        next.x = clamp(start.x + deltaX, 0, start.x + start.width - 1);
        next.width = start.width - (next.x - start.x);
      }
      if (dragMode.includes('e')) {
        next.width = clamp(start.width + deltaX, 1, 100 - start.x);
      }

      // Aspect Ratio Correction for Resize
      if (aspectRatio && imageRef.current) {
        const imgAspect = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
        // In percentage terms: width% / height% = aspect / imgAspect
        // So height% = width% * imgAspect / aspect
        
        // Priority to Width for E/W drag, Priority to Height for N/S drag usually, 
        // but simple implementation: just recalculate one based on the dominant axis or fixed logic.
        // Let's rely on Width as master for simple aspect lock
        if (dragMode.includes('e') || dragMode.includes('w')) {
             next.height = (next.width * imgAspect) / aspectRatio;
             // If height overflow, adjust width back
             if (next.y + next.height > 100) {
                 next.height = 100 - next.y;
                 next.width = (next.height * aspectRatio) / imgAspect;
             }
        } else {
             next.width = (next.height * aspectRatio) / imgAspect;
             // If width overflow, adjust height back
             if (next.x + next.width > 100) {
                 next.width = 100 - next.x;
                 next.height = (next.width * imgAspect) / aspectRatio;
             }
        }
      }
    }

    setCrop(next);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setDragMode(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="w-full select-none" ref={containerRef}>
      <div className="relative w-full h-full touch-none">
        {/* The Image */}
        <img 
          ref={imageRef}
          src={imageSrc} 
          alt="Crop Target" 
          className="w-full h-auto block pointer-events-none select-none"
          draggable={false}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay - Darkened areas outside crop */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none">
          {/* Clip path to show the clear area? Or simpler: composed divs. 
              Let's use a simple clear div with a massive border or box-shadow approach 
              or just a clear div on top of the darkened overlay using clip-path */}
        </div>
        
        {/* The Crop Box */}
        <div 
          className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move touch-none"
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`,
          }}
          onPointerDown={(e) => handlePointerDown(e, 'move')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Grid lines (rule of thirds) */}
          <div className="absolute inset-0 flex flex-col pointer-events-none opacity-40">
            <div className="flex-1 border-b border-white/50"></div>
            <div className="flex-1 border-b border-white/50"></div>
            <div className="flex-1"></div>
          </div>
          <div className="absolute inset-0 flex pointer-events-none opacity-40">
            <div className="flex-1 border-r border-white/50"></div>
            <div className="flex-1 border-r border-white/50"></div>
            <div className="flex-1"></div>
          </div>

          {/* Handles */}
          <div 
            className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-primary border-2 border-white cursor-nw-resize pointer-events-auto"
            onPointerDown={(e) => handlePointerDown(e, 'nw')}
          ></div>
          <div 
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary border-2 border-white cursor-ne-resize pointer-events-auto"
            onPointerDown={(e) => handlePointerDown(e, 'ne')}
          ></div>
          <div 
            className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-primary border-2 border-white cursor-sw-resize pointer-events-auto"
            onPointerDown={(e) => handlePointerDown(e, 'sw')}
          ></div>
          <div 
            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-primary border-2 border-white cursor-se-resize pointer-events-auto"
            onPointerDown={(e) => handlePointerDown(e, 'se')}
          ></div>
        </div>
      </div>
    </div>
  );
};