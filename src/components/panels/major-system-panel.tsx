'use client';

import { useState, useMemo } from 'react';
import { MATH_CONSTANTS, getDigitsOnly, MAJOR_SYSTEM, MAJOR_SYSTEM_WORDS } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { RefreshCw, Volume2 } from 'lucide-react';

interface MajorSystemPanelProps {
  numberId: string;
}

export function MajorSystemPanel({ numberId }: MajorSystemPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [inputDigits, setInputDigits] = useState('');
  const [startPosition, setStartPosition] = useState(1);
  const [chunkSize, setChunkSize] = useState(2);

  const number = useMemo(() => {
    const builtIn = MATH_CONSTANTS.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const digits = useMemo(() => {
    if (!number) return '';
    return number ? getDigitsOnly(number) : '';
  }, [number]);

  // Get chunk from the number
  const currentChunk = useMemo(() => {
    return digits.slice(startPosition - 1, startPosition - 1 + chunkSize * 5);
  }, [digits, startPosition, chunkSize]);

  // Convert digits to major system sounds
  const convertToSounds = (digitStr: string): string[] => {
    return digitStr.split('').map(d => MAJOR_SYSTEM[d]?.join('/') || '?');
  };

  // Get suggested words for digit pairs
  const getSuggestedWords = (digitStr: string): string[] => {
    const pairs: string[] = [];
    for (let i = 0; i < digitStr.length; i += 2) {
      const pair = digitStr.slice(i, i + 2);
      if (MAJOR_SYSTEM_WORDS[pair]) {
        pairs.push(MAJOR_SYSTEM_WORDS[pair][0]);
      } else {
        pairs.push('...');
      }
    }
    return pairs;
  };

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Major System - {number.name}
        </h2>
      </div>

      {/* Reference table */}
      <div className="mb-6 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
        <h3 className="text-sm font-medium mb-3">Major System Reference</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 text-center">
          {Object.entries(MAJOR_SYSTEM).map(([digit, sounds]) => (
            <div key={digit} className="p-2 bg-[var(--background)] rounded">
              <div className="text-2xl font-mono text-[var(--primary)]">{digit}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {sounds.slice(0, 2).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position selector */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-sm text-[var(--text-muted)] block mb-1">Start position</label>
          <input
            type="number"
            min={1}
            max={digits.length}
            value={startPosition}
            onChange={(e) => setStartPosition(Math.max(1, Number(e.target.value)))}
            className="input w-24"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--text-muted)] block mb-1">Words per group</label>
          <select
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className="input w-24"
          >
            <option value={2}>2 digits</option>
            <option value={3}>3 digits</option>
            <option value={4}>4 digits</option>
          </select>
        </div>
      </div>

      {/* Digit to word conversion */}
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-3">
          Positions {startPosition} - {startPosition + currentChunk.length - 1}
        </h3>
        
        <div className="space-y-4">
          {/* Split into groups */}
          {Array.from({ length: Math.ceil(currentChunk.length / (chunkSize * 2)) }, (_, groupIndex) => {
            const groupStart = groupIndex * chunkSize * 2;
            const groupDigits = currentChunk.slice(groupStart, groupStart + chunkSize * 2);
            const position = startPosition + groupStart;
            
            return (
              <div 
                key={groupIndex}
                className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[var(--text-muted)]">
                    Pos {position}-{position + groupDigits.length - 1}
                  </span>
                </div>
                
                {/* Digits */}
                <div className="text-3xl font-mono tracking-widest mb-4 text-[var(--primary)]">
                  {groupDigits.split('').map((d, i) => (
                    <span key={i} className={i > 0 && i % 2 === 0 ? 'ml-4' : ''}>
                      {d}
                    </span>
                  ))}
                </div>
                
                {/* Sounds */}
                <div className="flex flex-wrap gap-4 mb-3">
                  {groupDigits.split('').map((d, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl font-mono">{d}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {MAJOR_SYSTEM[d]?.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Suggested words */}
                <div className="flex flex-wrap gap-2">
                  {getSuggestedWords(groupDigits).map((word, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom converter */}
      <div className="mt-6 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
        <h3 className="text-sm font-medium mb-3">Convert Custom Digits</h3>
        <input
          type="text"
          value={inputDigits}
          onChange={(e) => setInputDigits(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Enter digits to convert..."
          className="input font-mono mb-3"
        />
        {inputDigits && (
          <div className="flex flex-wrap gap-4">
            {inputDigits.split('').map((d, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-mono text-[var(--primary)]">{d}</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {MAJOR_SYSTEM[d]?.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
