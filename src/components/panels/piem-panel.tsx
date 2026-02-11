'use client';

import { useState, useMemo } from 'react';
import { NUMBER_BANK, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Copy, Check, Sparkles } from 'lucide-react';

interface PiemPanelProps {
  numberId: string;
}

// Famous piems
const FAMOUS_PIEMS = [
  {
    name: "Classic Pi Piem",
    text: "How I want a drink, alcoholic of course, after the heavy lectures involving quantum mechanics.",
    digits: "3.14159265358979",
  },
  {
    name: "Simple Pi Piem",
    text: "May I have a large container of coffee?",
    digits: "3.1415926",
  },
  {
    name: "Euler's Number Piem",
    text: "To express e, remember to memorize a sentence to simplify this.",
    digits: "2.718281828",
  },
];

export function PiemPanel({ numberId }: PiemPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [userPiem, setUserPiem] = useState('');
  const [copied, setCopied] = useState(false);
  const [targetDigits, setTargetDigits] = useState(10);
  const [startPosition, setStartPosition] = useState(1);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const digits = useMemo(() => {
    if (!number) return '';
    return number ? getDigitsOnly(number) : '';
  }, [number]);

  const targetDigitStr = digits.slice(startPosition - 1, startPosition - 1 + targetDigits);

  // Convert piem to digits
  const piemToDigits = (text: string): string => {
    return text
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => {
        const cleanWord = word.replace(/[^a-zA-Z]/g, '');
        const len = cleanWord.length;
        return len === 10 ? '0' : len.toString();
      })
      .join('');
  };

  // Check if piem matches target
  const userDigits = piemToDigits(userPiem);
  const matchResult = useMemo(() => {
    const matches: boolean[] = [];
    for (let i = 0; i < userDigits.length; i++) {
      matches.push(userDigits[i] === targetDigitStr[i]);
    }
    return matches;
  }, [userDigits, targetDigitStr]);

  const isComplete = userDigits.length >= targetDigits && matchResult.every(m => m);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(userPiem);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Piem Generator - {number.name}
        </h2>
      </div>

      {/* Explanation */}
      <div className="mb-6 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[var(--primary)] mt-0.5" />
          <div>
            <h3 className="font-medium mb-1">What is a Piem?</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              A piem is a poem or sentence where the number of letters in each word 
              corresponds to consecutive digits. Words with 10 letters represent 0.
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-6 flex flex-wrap gap-4">
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
          <label className="text-sm text-[var(--text-muted)] block mb-1">Target digits</label>
          <input
            type="number"
            min={5}
            max={50}
            value={targetDigits}
            onChange={(e) => setTargetDigits(Number(e.target.value))}
            className="input w-24"
          />
        </div>
      </div>

      {/* Target digits display */}
      <div className="mb-6">
        <label className="text-sm text-[var(--text-muted)] block mb-2">Target digits to encode:</label>
        <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] font-mono text-2xl tracking-wider">
          {targetDigitStr.split('').map((d, i) => (
            <span 
              key={i} 
              className={`
                ${i < userDigits.length 
                  ? matchResult[i] 
                    ? 'text-[var(--success)]' 
                    : 'text-[var(--error)]'
                  : 'text-[var(--text-muted)]'
                }
              `}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Piem input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-[var(--text-muted)]">Write your piem:</label>
          <button
            onClick={handleCopy}
            disabled={!userPiem}
            className="btn btn-ghost text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <textarea
          value={userPiem}
          onChange={(e) => setUserPiem(e.target.value)}
          className="input h-32 resize-none"
          placeholder="Type a sentence where each word's letter count matches the target digits..."
        />
        
        {/* Live feedback */}
        <div className="mt-4 p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Your digits:</span>
            <span className="text-sm">
              {userDigits.length}/{targetDigits} digits
            </span>
          </div>
          <div className="font-mono text-lg tracking-wider">
            {userDigits.split('').map((d, i) => (
              <span 
                key={i}
                className={matchResult[i] ? 'text-[var(--success)]' : 'text-[var(--error)]'}
              >
                {d}
              </span>
            ))}
            <span className="text-[var(--text-muted)] animate-pulse">|</span>
          </div>
          
          {isComplete && (
            <div className="mt-3 text-[var(--success)] font-medium">
              ✓ Perfect! Your piem matches the target digits!
            </div>
          )}
        </div>
      </div>

      {/* Example piems */}
      <div className="mt-auto">
        <h3 className="text-sm font-medium mb-3">Famous Piems</h3>
        <div className="space-y-3">
          {FAMOUS_PIEMS.map((piem, i) => (
            <div 
              key={i}
              className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{piem.name}</span>
                <span className="text-xs text-[var(--text-muted)] font-mono">{piem.digits}</span>
              </div>
              <p className="text-[var(--text-secondary)] italic">"{piem.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
