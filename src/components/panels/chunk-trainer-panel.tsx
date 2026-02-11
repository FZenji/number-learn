'use client';

import { useState, useMemo, useEffect } from 'react';
import { NUMBER_BANK, getDigitsOnly, chunkDigits } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Eye, EyeOff, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface ChunkTrainerPanelProps {
  numberId: string;
}

export function ChunkTrainerPanel({ numberId }: ChunkTrainerPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [chunkSize, setChunkSize] = useState(5);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [showChunk, setShowChunk] = useState(true);
  const [masteredChunks, setMasteredChunks] = useState<Set<number>>(new Set());

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const digits = useMemo(() => {
    if (!number) return '';
    return number ? getDigitsOnly(number) : '';
  }, [number]);

  const chunks = useMemo(() => chunkDigits(digits, chunkSize), [digits, chunkSize]);

  const currentChunk = chunks[currentChunkIndex] || '';
  const startPosition = currentChunkIndex * chunkSize + 1;

  const goToNext = () => {
    if (currentChunkIndex < chunks.length - 1) {
      setCurrentChunkIndex(prev => prev + 1);
      setShowChunk(true);
    }
  };

  const goToPrev = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex(prev => prev - 1);
      setShowChunk(true);
    }
  };

  const toggleMastered = () => {
    setMasteredChunks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentChunkIndex)) {
        newSet.delete(currentChunkIndex);
      } else {
        newSet.add(currentChunkIndex);
      }
      return newSet;
    });
  };

  const reset = () => {
    setCurrentChunkIndex(0);
    setShowChunk(true);
    setMasteredChunks(new Set());
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'h') {
        setShowChunk(prev => !prev);
      } else if (e.key === 'm') {
        toggleMastered();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChunkIndex, chunks.length]);

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Chunk Trainer - {number.name}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-muted)]">Chunk size:</span>
            <select
              value={chunkSize}
              onChange={(e) => {
                setChunkSize(Number(e.target.value));
                setCurrentChunkIndex(0);
              }}
              className="input w-20 py-1"
            >
              {[3, 4, 5, 6, 7, 8, 10].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <button onClick={reset} className="btn btn-ghost">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
          <span>Progress: {currentChunkIndex + 1} / {chunks.length}</span>
          <span>Mastered: {masteredChunks.size} / {chunks.length}</span>
        </div>
        <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${((currentChunkIndex + 1) / chunks.length) * 100}%` }}
          />
        </div>
        {/* Chunk indicators */}
        <div className="flex gap-1 mt-2 overflow-x-auto py-1">
          {chunks.slice(0, 50).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentChunkIndex(i);
                setShowChunk(true);
              }}
              className={`
                w-3 h-3 rounded-full flex-shrink-0 transition-colors
                ${i === currentChunkIndex ? 'bg-[var(--primary)]' : ''}
                ${masteredChunks.has(i) ? 'bg-[var(--success)]' : 'bg-[var(--surface-active)]'}
              `}
              title={`Chunk ${i + 1}`}
            />
          ))}
          {chunks.length > 50 && (
            <span className="text-xs text-[var(--text-muted)]">+{chunks.length - 50}</span>
          )}
        </div>
      </div>

      {/* Main flashcard */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div 
          className={`
            w-full max-w-md p-8 rounded-2xl border-2 cursor-pointer transition-all
            ${masteredChunks.has(currentChunkIndex) 
              ? 'border-[var(--success)] bg-[var(--success)]/5' 
              : 'border-[var(--border)] bg-[var(--surface)]'
            }
          `}
          onClick={() => setShowChunk(!showChunk)}
        >
          <div className="text-center mb-4">
            <span className="text-sm text-[var(--text-muted)]">
              Positions {startPosition} - {startPosition + currentChunk.length - 1}
            </span>
          </div>
          
          <div className="text-center min-h-[80px] flex items-center justify-center">
            {showChunk ? (
              <span className="text-5xl md:text-6xl font-mono tracking-wider text-[var(--primary)]">
                {currentChunk}
              </span>
            ) : (
              <span className="text-4xl text-[var(--text-muted)]">
                Click to reveal
              </span>
            )}
          </div>

          <div className="text-center mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowChunk(!showChunk);
              }}
              className="btn btn-ghost text-sm"
            >
              {showChunk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showChunk ? 'Hide' : 'Show'} (H)
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={goToPrev}
            disabled={currentChunkIndex === 0}
            className="btn btn-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          
          <button
            onClick={toggleMastered}
            className={`btn ${masteredChunks.has(currentChunkIndex) ? 'btn-primary' : 'btn-secondary'}`}
          >
            {masteredChunks.has(currentChunkIndex) ? '✓ Mastered' : 'Mark Mastered'} (M)
          </button>
          
          <button
            onClick={goToNext}
            disabled={currentChunkIndex === chunks.length - 1}
            className="btn btn-secondary"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="mt-4 text-center text-sm text-[var(--text-muted)]">
        Use <span className="kbd">←</span> <span className="kbd">→</span> to navigate, 
        <span className="kbd">H</span> to toggle, <span className="kbd">M</span> to mark mastered
      </div>
    </div>
  );
}
