'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { NUMBER_BANK, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { ZoomIn, ZoomOut, RotateCcw, Settings } from 'lucide-react';

interface TimelinePanelProps {
  numberId: string;
}

export function TimelinePanel({ numberId }: TimelinePanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [viewportStart, setViewportStart] = useState(0);
  const [viewportSize, setViewportSize] = useState(100); // Default to 100 digits visible
  const [currentOffset, setCurrentOffset] = useState(0); // Position within viewport
  const [isDraggingViewport, setIsDraggingViewport] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const minimapRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartViewportStart = useRef<number>(0);
  const dragStartViewportSize = useRef<number>(0);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const allDigits = useMemo(() => {
    if (!number) return '';
    return getDigitsOnly(number);
  }, [number]);

  const totalDigits = allDigits.length;

  // Ensure viewport constraints
  useEffect(() => {
    if (viewportSize > totalDigits && totalDigits > 0) {
      setViewportSize(totalDigits);
    }
    if (viewportStart + viewportSize > totalDigits && totalDigits > 0) {
      setViewportStart(Math.max(0, totalDigits - viewportSize));
    }
  }, [totalDigits, viewportSize, viewportStart]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentOffset(prev => Math.min(prev + 1, viewportSize - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentOffset(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewportSize]);

  // Mouse handlers for Minimap
  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'move' | 'resize-left' | 'resize-right') => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStartX.current = e.clientX;
    dragStartViewportStart.current = viewportStart;
    dragStartViewportSize.current = viewportSize;

    if (type === 'move') setIsDraggingViewport(true);
    if (type === 'resize-left') setIsResizingLeft(true);
    if (type === 'resize-right') setIsResizingRight(true);
  }, [viewportStart, viewportSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!minimapRef.current) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const deltaPixels = e.clientX - dragStartX.current;
    
    // Convert pixels to digits
    const digitsPerPixel = totalDigits / rect.width;
    const deltaDigits = Math.round(deltaPixels * digitsPerPixel);

    if (isDraggingViewport) {
      const newStart = Math.max(0, Math.min(totalDigits - dragStartViewportSize.current, dragStartViewportStart.current + deltaDigits));
      setViewportStart(newStart);
    } else if (isResizingLeft) {
      // Moving left edge changes start AND size
      const proposedStart = Math.min(dragStartViewportStart.current + deltaDigits, dragStartViewportStart.current + dragStartViewportSize.current - 20); // Min 20 digits
      const newStart = Math.max(0, proposedStart);
      const newSize = dragStartViewportSize.current + (dragStartViewportStart.current - newStart);
      setViewportStart(newStart);
      setViewportSize(Math.min(500, newSize));
    } else if (isResizingRight) {
      // Moving right edge changes size only
      const newSize = Math.max(20, Math.min(500, dragStartViewportSize.current + deltaDigits));
      // Ensure we don't go past end
      const constrainedSize = Math.min(newSize, totalDigits - dragStartViewportStart.current);
      setViewportSize(constrainedSize);
    }
  }, [isDraggingViewport, isResizingLeft, isResizingRight, totalDigits]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingViewport(false);
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  useEffect(() => {
    if (isDraggingViewport || isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingViewport, isResizingLeft, isResizingRight, handleMouseMove, handleMouseUp]);

  // Click on minimap background to jump
  const handleMinimapBackgroundClick = (e: React.MouseEvent) => {
    if (!minimapRef.current) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const centerDigit = Math.round(percentage * totalDigits);
    const newStart = Math.max(0, Math.min(totalDigits - viewportSize, centerDigit - Math.floor(viewportSize / 2)));
    setViewportStart(newStart);
  };

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  const currentDigitIndex = viewportStart + currentOffset;
  const currentDigit = allDigits[currentDigitIndex] || '';

  // Render context digits
  const renderContext = () => {
    // Show +/- 3 digits around current
    const contextRange = Array.from({ length: 7 }, (_, i) => i - 3);
    return (
      <div className="flex justify-center items-center gap-1 min-h-[40px]">
        {contextRange.map(offset => {
          const idx = currentDigitIndex + offset;
          const digit = allDigits[idx];
          if (idx < 0 || idx >= totalDigits) return <span key={offset} className="w-8" />;
          
          return (
            <span 
              key={offset}
              className={`
                w-8 text-center text-xl font-mono transition-all
                ${offset === 0 
                  ? 'text-[var(--primary)] font-bold scale-125' 
                  : 'text-[var(--text-muted)] opacity-50'}
              `}
            >
              {digit}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Timeline - {number.name}
        </h2>
        <div className="flex items-center gap-2">
           <button onClick={() => { setViewportStart(0); setCurrentOffset(0); }} className="btn btn-ghost p-2">
             <RotateCcw className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        
        {/* Large Digit */}
        <div className="relative mb-8">
           <div className="w-48 h-48 rounded-3xl bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)] opacity-20"></div>
             <span className="text-9xl font-mono font-bold text-[var(--primary)]">
               {currentDigit}
             </span>
             <div className="absolute bottom-2 right-4 text-xs text-[var(--text-muted)] font-mono">
               #{currentDigitIndex + 1}
             </div>
           </div>
        </div>

        {/* Local Context */}
        {renderContext()}

        {/* Local Slider */}
        <div className="w-full max-w-md mt-8 px-4">
           <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
             <span>Viewport Start: {viewportStart + 1}</span>
             <span>Current: {currentDigitIndex + 1}</span>
             <span>End: {viewportStart + viewportSize}</span>
           </div>
           <input
             type="range"
             min={0}
             max={viewportSize - 1}
             value={currentOffset}
             onChange={(e) => setCurrentOffset(Number(e.target.value))}
             className="w-full h-2 bg-[var(--surface-hover)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
           />
           <div className="text-center text-xs text-[var(--text-muted)] mt-2">
             Slide to navigate within highlighted region
           </div>
        </div>
      </div>

      {/* Full-length Minimap */}
      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <div className="text-xs text-[var(--text-muted)] mb-2 flex justify-between">
          <span>Overview ({totalDigits} digits)</span>
          <span>Highlighted: {viewportSize} digits</span>
        </div>
        
        <div 
          ref={minimapRef}
          className="h-16 bg-[var(--surface-hover)] rounded-lg relative cursor-pointer overflow-hidden border border-[var(--border)]"
          onClick={handleMinimapBackgroundClick}
        >
          {/* Viewport Highlight */}
          <div
            className="absolute top-0 h-full border-2 border-[var(--primary)] bg-[var(--primary)]/10 cursor-move group hover:bg-[var(--primary)]/20 transition-colors"
            style={{
              left: `${(viewportStart / totalDigits) * 100}%`,
              width: `${(viewportSize / totalDigits) * 100}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Handle */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-[var(--primary)] flex items-center justify-center group-hover/left:bg-[var(--primary)]"
              onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
            >
              <div className="h-4 w-0.5 bg-[var(--primary)]/50 rounded-full" />
            </div>

            {/* Right Handle */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-[var(--primary)] flex items-center justify-center"
              onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
            >
               <div className="h-4 w-0.5 bg-[var(--primary)]/50 rounded-full" />
            </div>

            {/* Label in Highlight */}
            {viewportSize / totalDigits > 0.1 && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-[10px] font-mono text-[var(--primary)] font-bold bg-[var(--surface)]/80 px-1 rounded">
                   {viewportSize}
                 </span>
               </div>
            )}
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mt-1 text-center">
          Drag region to move • Drag edges to resize • Click anywhere to jump
        </div>
      </div>
    </div>
  );
}
