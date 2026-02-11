'use client';

import { useState, useMemo } from 'react';
import { NUMBER_BANK, chunkDigits, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Copy, Check, Settings } from 'lucide-react';

interface DigitDisplayPanelProps {
  numberId: string;
}

export function DigitDisplayPanel({ numberId }: DigitDisplayPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [chunkSize, setChunkSize] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState<number | null>(null);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  const digits = number ? getDigitsOnly(number) : '';
  const chunks = chunkDigits(digits, chunkSize);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(number.digits);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPositionFromChunk = (chunkIndex: number, digitIndex: number) => {
    return chunkIndex * chunkSize + digitIndex + 1;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-3xl font-mono text-[var(--primary)]">
              {'symbol' in number ? String(number.symbol) : '#'}
            </span>
            {number.name}
          </h2>
          {'description' in number && (
            <p className="text-sm text-[var(--text-muted)] mt-1">{String(number.description)}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            title="Copy all digits"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn btn-ghost ${showSettings ? 'bg-[var(--surface)]' : ''}`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="mb-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] animate-fade-in">
          <label className="flex items-center gap-4">
            <span className="text-sm">Chunk size:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-mono w-8">{chunkSize}</span>
          </label>
        </div>
      )}

      {/* Digit display */}
      <div className="flex-1 overflow-auto bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {chunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} className="flex items-center">
              <span className="text-[10px] font-mono text-[var(--text-muted)] w-10 text-right mr-3 shrink-0">
                {chunkIndex * chunkSize + 1}
              </span>
              <div className="flex">
                {chunk.split('').map((digit, digitIndex) => {
                  const position = getPositionFromChunk(chunkIndex, digitIndex);
                  return (
                    <span
                      key={digitIndex}
                      className={`
                        digit cursor-pointer rounded transition-colors
                        ${highlightPosition === position 
                          ? 'digit-current' 
                          : 'hover:bg-[var(--surface-hover)]'
                        }
                      `}
                      onClick={() => setHighlightPosition(position === highlightPosition ? null : position)}
                      title={`Position ${position}`}
                    >
                      {digit}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position indicator */}
      {highlightPosition && (
        <div className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Position <span className="font-mono font-bold text-[var(--primary)]">{highlightPosition}</span>: 
          <span className="font-mono ml-2">{digits[highlightPosition - 1]}</span>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 flex gap-6 text-sm text-[var(--text-muted)]">
        <span>Total digits: <span className="font-mono">{digits.length}</span></span>
        <span>Chunks: <span className="font-mono">{chunks.length}</span></span>
      </div>
    </div>
  );
}
