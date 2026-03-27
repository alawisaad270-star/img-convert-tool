import React, { useRef, useState, useEffect } from 'react';

interface VisualWatermarkProps {
  imageSrc: string;
  config: {
    type: 'text' | 'image';
    text: string;
    imageSrc: string | null;
    x: number; // %
    y: number; // %
    opacity: number;
    rotation: number;
    scale: number;
    color: string;
  };
  onChange: (updates: Partial<{ x: number; y: number }>) => void;
}

export const VisualWatermark: React.FC<VisualWatermarkProps> = ({ imageSrc, config, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Track drag state: start mouse pos (mx, my) and start config pos (px, py)
  const [dragStart, setDragStart] = useState<{ mx: number; my: number; px: number; py: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [imageSrc]); // Re-measure if image source changes

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Capture pointer and store initial state
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragStart({
        mx: e.clientX,
        my: e.clientY,
        px: config.x,
        py: config.y
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    // Calculate delta in pixels
    const dx = e.clientX - dragStart.mx;
    const dy = e.clientY - dragStart.my;

    // Convert delta to percentage of container dimensions
    const dxPercent = (dx / rect.width) * 100;
    const dyPercent = (dy / rect.height) * 100;
    
    // Apply delta to initial position
    const newX = Math.max(0, Math.min(100, dragStart.px + dxPercent));
    const newY = Math.max(0, Math.min(100, dragStart.py + dyPercent));
    
    onChange({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragStart(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50/50 p-4 select-none overflow-hidden">
      {/* 
        This wrapper shrinks to fit the image dimensions exactly. 
        This ensures 'left: 0%' is the left edge of the IMAGE, not the gray background.
      */}
      <div 
        ref={containerRef}
        className="relative inline-block shadow-lg"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        <img 
          src={imageSrc} 
          className="block max-w-full max-h-[500px] w-auto h-auto object-contain pointer-events-none" 
          draggable={false}
          alt="Target"
        />
        
        {/* Watermark Overlay Area - strictly matches image size */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute cursor-move touch-none origin-center pointer-events-auto"
            style={{
              left: `${config.x}%`,
              top: `${config.y}%`,
              transform: `translate(-50%, -50%) rotate(${config.rotation}deg) scale(${config.scale})`,
              opacity: config.opacity,
              maxWidth: '100%', 
              maxHeight: '100%'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {config.type === 'text' ? (
              <div 
                className="whitespace-nowrap font-bold select-none text-3xl sm:text-4xl px-2 py-1 border-2 border-transparent hover:border-dashed hover:border-primary/50 transition-colors"
                style={{ 
                  color: config.color,
                  textShadow: '0px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {config.text || 'Watermark'}
              </div>
            ) : (
              // Image Logo Mode
              <div className="border-2 border-transparent hover:border-dashed hover:border-primary/50 transition-colors inline-block">
                 {config.imageSrc ? (
                  <img 
                    src={config.imageSrc} 
                    alt="Logo" 
                    className="block pointer-events-none select-none"
                    draggable={false}
                    // Base width is 20% of the parent image width (tracked via ResizeObserver)
                    width={containerWidth ? containerWidth * 0.2 : 100}
                    style={{ height: 'auto' }}
                  />
                ) : (
                  <div className="w-32 h-16 bg-slate-200/80 backdrop-blur flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-400 rounded">
                      No Logo
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity z-10">
         <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm shadow-sm">Drag to position • Use sidebar to resize</span>
      </div>
    </div>
  );
};