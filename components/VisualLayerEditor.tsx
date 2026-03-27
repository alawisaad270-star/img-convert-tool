
import React, { useRef, useState, useEffect } from 'react';
import { EditorLayer, TextLayer, DrawingLayer, ShapeLayer, ImageOverlayLayer } from '../types';

interface VisualLayerEditorProps {
  imageSrc: string;
  layers: EditorLayer[];
  activeLayerId: string | null;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    grayscale: number;
    sepia: number;
    invert: number;
    hueRotate: number;
    rotation: number;
    flipX: boolean;
    flipY: boolean;
  };
  zoom: number;
  toolMode: 'select' | 'draw' | 'text' | 'shape' | 'sticker';
  drawingColor?: string;
  drawingBrushSize?: number;
  onUpdateLayer: (id: string, updates: Partial<EditorLayer>) => void;
  onSelectLayer: (id: string | null) => void;
  onAddDrawingLayer: (points: { x: number; y: number }[], strokeWidth: number) => void;
}

export const VisualLayerEditor: React.FC<VisualLayerEditorProps> = ({
  imageSrc,
  layers,
  activeLayerId,
  adjustments,
  zoom,
  toolMode,
  drawingColor = '#ff0000',
  drawingBrushSize = 5,
  onUpdateLayer,
  onSelectLayer,
  onAddDrawingLayer
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<{ width: number; height: number } | null>(null);
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; initX: number; initY: number } | null>(null);
  
  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Update container dimensions for calculating scale
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerRect({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [imageSrc, adjustments.rotation]);

  const getRelativeCoords = (e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  };

  const getScaledStroke = (pixels: number) => {
      if (!containerRect || containerRect.width === 0) return 0.5; // fallback
      return (pixels / containerRect.width) * 100;
  };

  const handlePointerDown = (e: React.PointerEvent, layer?: EditorLayer) => {
    if (toolMode === 'draw') {
        e.preventDefault();
        (e.target as Element).setPointerCapture(e.pointerId);
        setIsDrawing(true);
        const coords = getRelativeCoords(e);
        setCurrentPath([coords]);
        return;
    }

    if (layer) {
        e.preventDefault();
        e.stopPropagation();
        onSelectLayer(layer.id);
        (e.target as Element).setPointerCapture(e.pointerId);
        setDragState({
            id: layer.id,
            startX: e.clientX,
            startY: e.clientY,
            initX: layer.x,
            initY: layer.y
        });
    } else {
        onSelectLayer(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (toolMode === 'draw' && isDrawing) {
        const coords = getRelativeCoords(e);
        setCurrentPath(prev => [...prev, coords]);
        return;
    }

    if (!dragState || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    // Convert pixels to percentage
    const dxPercent = (dx / rect.width) * 100;
    const dyPercent = (dy / rect.height) * 100;

    onUpdateLayer(dragState.id, {
      x: dragState.initX + dxPercent,
      y: dragState.initY + dyPercent
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (toolMode === 'draw' && isDrawing) {
        setIsDrawing(false);
        if (currentPath.length > 1) {
            onAddDrawingLayer(currentPath, getScaledStroke(drawingBrushSize || 5));
        }
        setCurrentPath([]);
        (e.target as Element).releasePointerCapture(e.pointerId);
        return;
    }

    setDragState(null);
    if (e.target instanceof Element) {
       (e.target as Element).releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div 
        className="w-full h-full flex items-center justify-center p-4 select-none overflow-hidden relative cursor-default"
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        style={{ cursor: toolMode === 'draw' ? 'crosshair' : 'default' }}
    >
      <div 
        ref={containerRef}
        className="relative inline-block shadow-2xl transition-transform duration-200 ease-out"
        style={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
        }}
        onPointerDown={(e) => !dragState && handlePointerDown(e)}
      >
        {/* Base Image with CSS Filters */}
        <img 
          src={imageSrc} 
          alt="Edit Target"
          className="block max-w-full max-h-[500px] lg:max-h-[70vh] w-auto h-auto object-contain pointer-events-none"
          draggable={false}
          style={{
            filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) grayscale(${adjustments.grayscale}%) sepia(${adjustments.sepia}%) invert(${adjustments.invert}%) hue-rotate(${adjustments.hueRotate}deg)`,
            transform: `rotate(${adjustments.rotation}deg) scale(${adjustments.flipX ? -1 : 1}, ${adjustments.flipY ? -1 : 1})`,
            transition: 'transform 0.3s ease, filter 0.1s linear'
          }}
        />

        {/* Current Drawing Stroke Overlay */}
        {isDrawing && currentPath.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
                <path 
                    d={`M ${currentPath.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
                    stroke={drawingColor}
                    strokeWidth={`${getScaledStroke(drawingBrushSize || 5)}%`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )}

        {/* Layer Overlay Container */}
        <div className="absolute inset-0 overflow-hidden">
           {layers.map((layer) => {
             const baseSize = containerRect ? Math.min(containerRect.width, containerRect.height) : 100;
             const isActive = activeLayerId === layer.id;
             const isLocked = toolMode === 'draw'; // Lock layers when drawing

             // Render based on type
             if (layer.type === 'drawing') {
                 return (
                     <svg key={layer.id} className="absolute inset-0 w-full h-full pointer-events-none">
                         <path 
                            d={`M ${layer.points.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
                            stroke={layer.color}
                            strokeWidth={`${layer.strokeWidth}%`}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={layer.opacity}
                         />
                     </svg>
                 );
             }

             // Common Wrapper Style
             const wrapperStyle: React.CSSProperties = {
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                opacity: layer.opacity,
             };

             if (layer.type === 'text') {
                 const fontSizePx = (layer.fontSize / 100) * baseSize * 2; 
                 return (
                   <div
                     key={layer.id}
                     className={`absolute cursor-move touch-none origin-center pointer-events-auto flex items-center justify-center ${isActive ? 'z-50' : 'z-10'}`}
                     style={wrapperStyle}
                     onPointerDown={(e) => !isLocked && handlePointerDown(e, layer)}
                   >
                     <div 
                        className={`whitespace-pre px-2 py-1 border-2 transition-all duration-200 ${isActive ? 'border-primary border-dashed bg-primary/5' : 'border-transparent hover:border-white/50'}`}
                        style={{
                            fontFamily: layer.fontFamily,
                            fontSize: `${fontSizePx}px`,
                            color: layer.color,
                            fontWeight: layer.fontWeight,
                            fontStyle: layer.fontStyle,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            lineHeight: 1.2,
                            textAlign: 'center'
                        }}
                     >
                        {layer.text}
                        {isActive && <div className="absolute -inset-1 border border-primary opacity-50 rounded-lg pointer-events-none"></div>}
                     </div>
                   </div>
                 );
             } else if (layer.type === 'shape') {
                 const w = layer.width + '%';
                 const h = layer.height + '%';
                 return (
                     <div
                        key={layer.id}
                        className={`absolute cursor-move touch-none origin-center pointer-events-auto ${isActive ? 'z-50' : 'z-10'}`}
                        style={{...wrapperStyle, width: w, height: h}}
                        onPointerDown={(e) => !isLocked && handlePointerDown(e, layer)}
                     >
                        <div className={`w-full h-full transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                             {layer.shapeType === 'rectangle' && (
                                 <div className="w-full h-full" style={{ backgroundColor: layer.fillColor, border: `${layer.strokeWidth}px solid ${layer.strokeColor}` }}></div>
                             )}
                             {layer.shapeType === 'circle' && (
                                 <div className="w-full h-full rounded-full" style={{ backgroundColor: layer.fillColor, border: `${layer.strokeWidth}px solid ${layer.strokeColor}` }}></div>
                             )}
                             {layer.shapeType === 'triangle' && (
                                 <div className="w-full h-full" style={{ 
                                     width: 0, height: 0, 
                                     borderLeft: `${containerRect ? containerRect.width * (layer.width/100)/2 : 50}px solid transparent`,
                                     borderRight: `${containerRect ? containerRect.width * (layer.width/100)/2 : 50}px solid transparent`,
                                     borderBottom: `${containerRect ? containerRect.height * (layer.height/100) : 100}px solid ${layer.fillColor}`
                                 }}></div>
                             )}
                        </div>
                     </div>
                 );
             } else if (layer.type === 'image') {
                 const w = layer.width + '%';
                 return (
                    <div
                        key={layer.id}
                        className={`absolute cursor-move touch-none origin-center pointer-events-auto ${isActive ? 'z-50' : 'z-10'}`}
                        style={{...wrapperStyle, width: w}}
                        onPointerDown={(e) => !isLocked && handlePointerDown(e, layer)}
                     >
                         <img 
                            src={layer.src} 
                            alt="Sticker" 
                            className={`w-full h-auto block select-none pointer-events-none ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`} 
                            draggable={false}
                         />
                     </div>
                 );
             }
             return null;
           })}
        </div>
      </div>
    </div>
  );
};
