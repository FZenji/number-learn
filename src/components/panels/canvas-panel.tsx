'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { NUMBER_BANK } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Trash2, Save, Paintbrush, Eraser, Download, Minus, Circle } from 'lucide-react';

interface CanvasPanelProps {
  numberId: string;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
  type: 'solid' | 'dashed' | 'dotted';
}

const COLORS = [
  '#f5f5f5', // White
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
];

const SIZES = [
  { name: 'S', value: 2 },
  { name: 'M', value: 5 },
  { name: 'L', value: 10 },
];

const STROKE_TYPES: { name: string; value: 'solid' | 'dashed' | 'dotted' }[] = [
  { name: 'Solid', value: 'solid' },
  { name: 'Dashed', value: 'dashed' },
  { name: 'Dotted', value: 'dotted' },
];

export function CanvasPanel({ numberId }: CanvasPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1].value);
  const [strokeType, setStrokeType] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [isEraser, setIsEraser] = useState(false);
  const [saved, setSaved] = useState(false);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const storageKey = `canvas-${numberId}`;

  // Load saved strokes
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        setStrokes(JSON.parse(savedData));
      } catch {
        // Invalid data, ignore
      }
    }
  }, [storageKey]);

  // Auto-save
  useEffect(() => {
    if (strokes.length > 0) {
      const timer = setTimeout(() => {
        localStorage.setItem(storageKey, JSON.stringify(strokes));
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [strokes, storageKey]);

  // Redraw canvas whenever strokes change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    allStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (stroke.type === 'dashed') {
        ctx.setLineDash([10, 10]);
      } else if (stroke.type === 'dotted') {
        ctx.setLineDash([2, 8]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Handle canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const point = getPoint(e);
    setIsDrawing(true);
    setCurrentStroke({
      points: [point],
      color: isEraser ? '#0a0a0a' : color,
      size: isEraser ? size * 3 : size,
      type: strokeType,
    });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    
    const point = getPoint(e);
    setCurrentStroke(prev => prev ? {
      ...prev,
      points: [...prev.points, point],
    } : null);
  };

  const stopDrawing = () => {
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (confirm('Clear the canvas?')) {
      setStrokes([]);
      localStorage.removeItem(storageKey);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${number?.name || 'drawing'}-canvas.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-[var(--primary)]" />
          Canvas - {number.name}
        </h2>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-sm text-[var(--success)] flex items-center gap-1 animate-fade-in">
              <Save className="w-4 h-4" />
              Saved
            </span>
          )}
          <button onClick={handleDownload} className="btn btn-ghost">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={handleClear} className="btn btn-ghost text-[var(--error)]">
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] mb-4 flex-wrap">
        {/* Colors */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Color:</span>
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setIsEraser(false); }}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c && !isEraser ? 'border-[var(--primary)] scale-110' : 'border-transparent'
                }`}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Size:</span>
          <div className="flex gap-1">
            {SIZES.map(s => (
              <button
                key={s.name}
                onClick={() => setSize(s.value)}
                className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                  size === s.value 
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white' 
                    : 'bg-[var(--surface-hover)] border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                <Circle className="fill-current" style={{ width: s.value * 2, height: s.value * 2 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Stroke type */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Style:</span>
          <div className="flex gap-1">
            {STROKE_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setStrokeType(t.value)}
                className={`px-3 py-1 rounded text-xs border transition-colors ${
                  strokeType === t.value 
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white' 
                    : 'bg-[var(--surface-hover)] border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Eraser */}
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm border transition-colors ${
            isEraser 
              ? 'bg-[var(--warning)] border-[var(--warning)] text-black' 
              : 'bg-[var(--surface-hover)] border-[var(--border)] hover:border-[var(--border-hover)]'
          }`}
        >
          <Eraser className="w-4 h-4" />
          Eraser
        </button>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none"
        />
      </div>
    </div>
  );
}
