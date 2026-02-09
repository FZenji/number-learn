'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { MATH_CONSTANTS, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface TimelinePanelProps {
  numberId: string;
}

export function TimelinePanel({ numberId }: TimelinePanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [zoom, setZoom] = useState(1);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const number = useMemo(() => {
    const builtIn = MATH_CONSTANTS.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const digits = useMemo(() => {
    if (!number) return '';
    return number ? getDigitsOnly(number) : '';
  }, [number]);

  const visibleDigits = Math.min(500, digits.length);
  const digitWidth = 24 * zoom;
  const totalWidth = visibleDigits * digitWidth;

  const milestones = [1, 10, 25, 50, 100, 200, 314, 500];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition(container.scrollLeft);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    containerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
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
          <button onClick={handleZoomOut} className="btn btn-ghost p-2">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-[var(--text-muted)] w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn} className="btn btn-ghost p-2">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="btn btn-ghost p-2">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Position indicator */}
      {hoveredPosition !== null && (
        <div className="mb-4 p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] animate-fade-in">
          <span className="text-[var(--text-muted)]">Position </span>
          <span className="font-mono font-bold text-[var(--primary)]">{hoveredPosition}</span>
          <span className="text-[var(--text-muted)]">: </span>
          <span className="font-mono text-2xl">{digits[hoveredPosition - 1]}</span>
        </div>
      )}

      {/* Timeline */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden bg-[var(--surface)] rounded-lg border border-[var(--border)]"
      >
        <div 
          className="relative h-full min-h-[200px]"
          style={{ width: totalWidth + 40 }}
        >
          {/* Axis line */}
          <div 
            className="absolute top-1/2 left-5 right-5 h-0.5 bg-[var(--border)]"
          />

          {/* Milestone markers */}
          {milestones.filter(m => m <= visibleDigits).map(milestone => (
            <div
              key={milestone}
              className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
              style={{ left: 20 + (milestone - 1) * digitWidth }}
            >
              <div className="absolute top-4 text-xs font-mono text-[var(--primary)]">
                {milestone}
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-8 bg-[var(--primary)]" />
            </div>
          ))}

          {/* Digits */}
          <div className="absolute top-1/2 translate-y-4 left-5 flex">
            {digits.slice(0, visibleDigits).split('').map((digit, i) => (
              <div
                key={i}
                className={`
                  flex items-center justify-center cursor-pointer transition-all
                  ${hoveredPosition === i + 1 ? 'bg-[var(--primary)] text-white rounded' : ''}
                `}
                style={{ 
                  width: digitWidth, 
                  height: digitWidth,
                  fontSize: Math.max(10, 14 * zoom),
                }}
                onMouseEnter={() => setHoveredPosition(i + 1)}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                <span className="font-mono">{digit}</span>
              </div>
            ))}
          </div>

          {/* Position numbers (every 10) */}
          <div className="absolute bottom-4 left-5 flex">
            {Array.from({ length: Math.floor(visibleDigits / 10) }, (_, i) => (
              <div
                key={i}
                className="text-xs text-[var(--text-muted)] font-mono"
                style={{ 
                  position: 'absolute',
                  left: (i * 10 + 9) * digitWidth,
                }}
              >
                {(i + 1) * 10}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
        <span>Showing first {visibleDigits} digits</span>
        <span>•</span>
        <span>Scroll horizontally to explore</span>
        <span>•</span>
        <span>Hover over digits to see position</span>
      </div>
    </div>
  );
}
