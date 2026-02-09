'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MATH_CONSTANTS, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { ZoomIn, ZoomOut, RotateCcw, Settings } from 'lucide-react';

interface TimelinePanelProps {
  numberId: string;
}

export function TimelinePanel({ numberId }: TimelinePanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [currentPosition, setCurrentPosition] = useState(0);
  const [startDigit, setStartDigit] = useState(1);
  const [endDigit, setEndDigit] = useState(500);
  const [showSettings, setShowSettings] = useState(false);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const number = useMemo(() => {
    const builtIn = MATH_CONSTANTS.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const allDigits = useMemo(() => {
    if (!number) return '';
    return getDigitsOnly(number);
  }, [number]);

  // Apply start/end constraints
  const digits = useMemo(() => {
    const start = Math.max(0, startDigit - 1);
    const end = Math.min(allDigits.length, endDigit);
    return allDigits.slice(start, end);
  }, [allDigits, startDigit, endDigit]);

  const visibleDigits = Math.min(500, digits.length);
  const currentDigit = digits[currentPosition] || '';
  const absolutePosition = startDigit + currentPosition;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentPosition(prev => Math.min(prev + 1, visibleDigits - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentPosition(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentPosition(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentPosition(visibleDigits - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleDigits]);

  // Minimap dragging
  const handleMinimapClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const minimap = minimapRef.current;
    if (!minimap) return;

    const rect = minimap.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = x / rect.width;
    const newPosition = Math.round(percentage * (visibleDigits - 1));
    setCurrentPosition(Math.max(0, Math.min(newPosition, visibleDigits - 1)));
  }, [visibleDigits]);

  const handleMinimapMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMinimapClick(e);
  };

  const handleMinimapMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const minimap = minimapRef.current;
    if (!minimap) return;

    const rect = minimap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newPosition = Math.round(percentage * (visibleDigits - 1));
    setCurrentPosition(Math.max(0, Math.min(newPosition, visibleDigits - 1)));
  }, [isDragging, visibleDigits]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMinimapMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMinimapMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMinimapMouseMove, handleMouseUp]);

  const handleReset = () => {
    setCurrentPosition(0);
    setStartDigit(1);
    setEndDigit(Math.min(500, allDigits.length));
  };

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Number Timeline - {number.name}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn btn-ghost p-2 ${showSettings ? 'bg-[var(--surface-active)]' : ''}`}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="btn btn-ghost p-2">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-1">Start digit</label>
              <input
                type="number"
                min={1}
                max={allDigits.length}
                value={startDigit}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(Number(e.target.value), endDigit - 1));
                  setStartDigit(val);
                  setCurrentPosition(0);
                }}
                className="input"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-1">End digit (max 500)</label>
              <input
                type="number"
                min={startDigit + 1}
                max={Math.min(startDigit + 500, allDigits.length)}
                value={endDigit}
                onChange={(e) => {
                  const val = Math.max(startDigit + 1, Math.min(Number(e.target.value), startDigit + 500, allDigits.length));
                  setEndDigit(val);
                  setCurrentPosition(0);
                }}
                className="input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Current digit display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-7xl font-mono font-bold text-[var(--primary)]">
            {currentDigit}
          </span>
        </div>
        <div className="mt-3 text-[var(--text-muted)]">
          Position: <span className="font-mono font-semibold text-[var(--primary)]">{absolutePosition}</span> / {allDigits.length}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <input
          type="range"
          min={0}
          max={visibleDigits - 1}
          value={currentPosition}
          onChange={(e) => setCurrentPosition(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Context display */}
      <div className="mb-6 px-4">
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex justify-center items-center gap-0 font-mono text-lg overflow-hidden">
            {/* Show 10 digits before and after current */}
            {Array.from({ length: 21 }, (_, i) => {
              const idx = currentPosition - 10 + i;
              const digit = digits[idx];
              const isCurrent = idx === currentPosition;
              
              if (idx < 0 || idx >= digits.length) {
                return <span key={i} className="w-5 text-center opacity-0">0</span>;
              }
              
              return (
                <span
                  key={i}
                  className={`
                    w-5 text-center transition-all
                    ${isCurrent 
                      ? 'text-[var(--primary)] text-2xl font-bold bg-[var(--primary)]/20 rounded' 
                      : Math.abs(idx - currentPosition) <= 3
                        ? 'text-[var(--text-secondary)]'
                        : 'text-[var(--text-muted)]'
                    }
                  `}
                >
                  {digit}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Minimap */}
      <div className="mt-auto">
        <div className="text-sm text-[var(--text-muted)] mb-2">Overview (drag to navigate)</div>
        <div
          ref={minimapRef}
          className="h-12 bg-[var(--surface)] rounded-lg border border-[var(--border)] relative cursor-pointer overflow-hidden select-none"
          onMouseDown={handleMinimapMouseDown}
        >
          {/* Digit markers */}
          <div className="absolute inset-0 flex items-center px-2">
            <div className="flex-1 relative h-4">
              {/* Simplified digit representation */}
              {Array.from({ length: Math.min(100, visibleDigits) }, (_, i) => {
                const idx = Math.floor((i / 100) * visibleDigits);
                const digit = digits[idx];
                return (
                  <div
                    key={i}
                    className="absolute h-full w-[1%] flex items-center justify-center"
                    style={{ left: `${(idx / visibleDigits) * 100}%` }}
                  >
                    <div 
                      className="w-0.5 h-2 bg-[var(--text-muted)]"
                      style={{ 
                        height: `${parseInt(digit || '0') * 10 + 20}%`,
                        opacity: 0.3
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Current position indicator */}
          <div
            className="absolute top-1 bottom-1 w-6 bg-[var(--primary)] rounded opacity-50 transition-all"
            style={{ 
              left: `calc(${(currentPosition / visibleDigits) * 100}% - 12px)`,
              minWidth: '12px'
            }}
          />
          
          {/* Position labels */}
          <div className="absolute bottom-0 left-2 text-xs text-[var(--text-muted)]">{startDigit}</div>
          <div className="absolute bottom-0 right-2 text-xs text-[var(--text-muted)]">{startDigit + visibleDigits - 1}</div>
        </div>
      </div>

      {/* Help text */}
      <div className="mt-4 text-center text-sm text-[var(--text-muted)]">
        <p>Use <span className="kbd">←</span><span className="kbd">→</span> to navigate, <span className="kbd">Home</span>/<span className="kbd">End</span> to jump</p>
      </div>
    </div>
  );
}
