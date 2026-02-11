'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { MATH_CONSTANTS, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { CheckCircle, RotateCcw, Download, PartyPopper } from 'lucide-react';

interface RecallTestPanelProps {
  numberId: string;
}

type TestPhase = 'setup' | 'typing' | 'results';

interface DigitResult {
  typed: string;
  expected: string;
  correct: boolean;
}

export function RecallTestPanel({ numberId }: RecallTestPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [phase, setPhase] = useState<TestPhase>('setup');
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<DigitResult[]>([]);
  const [isPerfect, setIsPerfect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const number = useMemo(() => {
    const builtIn = MATH_CONSTANTS.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const digits = useMemo(() => {
    if (!number) return '';
    return getDigitsOnly(number);
  }, [number]);

  const startTest = () => {
    setPhase('typing');
    setUserInput('');
    setResults([]);
    setIsPerfect(false);
    setShowCelebration(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCheck = useCallback(() => {
    const typed = userInput.replace(/[^0-9]/g, '');
    if (typed.length === 0) return;

    const resultList: DigitResult[] = [];
    let allCorrect = true;

    for (let i = 0; i < typed.length; i++) {
      const expected = i < digits.length ? digits[i] : '?';
      const isCorrect = typed[i] === expected;
      if (!isCorrect) allCorrect = false;
      resultList.push({ typed: typed[i], expected, correct: isCorrect });
    }

    setResults(resultList);
    setIsPerfect(allCorrect && typed.length > 0);
    setPhase('results');

    // Count consecutive correct from start
    let consecutiveCorrect = 0;
    for (const r of resultList) {
      if (r.correct) consecutiveCorrect++;
      else break;
    }

    // Update progress
    const storageKey = `progress-${numberId}`;
    const saved = localStorage.getItem(storageKey);
    const progress = saved ? JSON.parse(saved) : {
      digitsLearned: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPracticeTime: 0,
      lastPracticeDate: null,
    };

    progress.digitsLearned = Math.max(progress.digitsLearned, consecutiveCorrect);
    localStorage.setItem(storageKey, JSON.stringify(progress));

    if (allCorrect) {
      localStorage.setItem('perfect-recall-achieved', 'true');
      setShowCelebration(true);
    }
  }, [userInput, digits, numberId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleCheck();
    }
  };

  const downloadCertificate = () => {
    if (!number) return;
    
    const correctCount = results.filter(r => r.correct).length;
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Number Learn - Certificate</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0a0a0a; font-family: 'Inter', sans-serif; }
          .cert {
            width: 800px; padding: 60px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border: 2px solid #f59e0b; border-radius: 24px; text-align: center; color: #f8fafc; position: relative; overflow: hidden;
          }
          .cert::before {
            content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: conic-gradient(from 0deg, transparent, rgba(245,158,11,0.05), transparent, rgba(245,158,11,0.05), transparent);
            animation: spin 20s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .cert-content { position: relative; z-index: 1; }
          .trophy { font-size: 64px; margin-bottom: 16px; }
          h1 { font-family: 'Playfair Display', serif; font-size: 36px; color: #f59e0b; margin-bottom: 8px; }
          .subtitle { color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 32px; }
          .achievement { font-size: 48px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
          .number-name { font-size: 20px; color: #f59e0b; margin-bottom: 32px; }
          .divider { width: 200px; height: 2px; background: linear-gradient(90deg, transparent, #f59e0b, transparent); margin: 24px auto; }
          .date { color: #64748b; font-size: 14px; }
          .footer { margin-top: 32px; color: #475569; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="cert-content">
            <div class="trophy">🏆</div>
            <h1>Certificate of Achievement</h1>
            <div class="subtitle">Number Learn Studio</div>
            <div class="divider"></div>
            <div class="achievement">${correctCount} Digits</div>
            <div class="number-name">of ${number.name} recalled correctly</div>
            <div class="divider"></div>
            <div class="date">${dateStr}</div>
            <div class="footer">number-learn.xyz</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const correctCount = results.filter(r => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Recall Test - {number.name}
        </h2>
        {phase === 'results' && (
          <div className="flex items-center gap-4 text-sm">
            <span className="font-mono">
              <span className="text-[var(--success)]">{correctCount}</span>
              <span className="text-[var(--text-muted)]"> / {results.length}</span>
            </span>
            <span className={`font-bold ${accuracy === 100 ? 'text-[var(--success)]' : accuracy >= 80 ? 'text-[var(--warning)]' : 'text-[var(--error)]'}`}>
              {accuracy}%
            </span>
          </div>
        )}
      </div>

      {/* Setup phase */}
      {phase === 'setup' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[var(--primary)]" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Free Recall Test</h3>
            <p className="text-[var(--text-muted)] mb-6">
              Type as many digits of <span className="text-[var(--primary)] font-medium">{number.name}</span> as you can remember. 
              When you&apos;re done, press <kbd className="px-2 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-xs font-mono">Check</kbd> to see your results.
            </p>
          </div>
          <button onClick={startTest} className="btn btn-primary text-lg px-8 py-4">
            Start Test
          </button>
        </div>
      )}

      {/* Typing phase */}
      {phase === 'typing' && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)] mb-1">
              Type the digits of {number.name} from memory. Don&apos;t include the decimal point — just digits.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Press <kbd className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs font-mono">Ctrl+Enter</kbd> to check
            </p>
          </div>

          <textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={handleKeyDown}
            className="flex-1 input font-mono text-2xl leading-relaxed p-4 resize-none min-h-[200px]"
            placeholder="Start typing digits..."
            autoFocus
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-muted)] font-mono">
              {userInput.replace(/[^0-9]/g, '').length} digits typed
            </span>
            <div className="flex gap-3">
              <button onClick={() => setPhase('setup')} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleCheck}
                disabled={userInput.replace(/[^0-9]/g, '').length === 0}
                className="btn btn-primary px-6"
              >
                <CheckCircle className="w-4 h-4" />
                Check
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results phase */}
      {phase === 'results' && (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Celebration banner */}
          {showCelebration && (
            <div className="p-6 bg-gradient-to-r from-[var(--success)]/20 to-[var(--primary)]/20 border border-[var(--success)] rounded-xl text-center animate-fade-in">
              <div className="text-4xl mb-2">🎉🏆🎉</div>
              <h3 className="text-2xl font-bold text-[var(--success)] mb-1">Perfect Recall!</h3>
              <p className="text-[var(--text-muted)]">
                You correctly recalled all {correctCount} digits of {number.name}!
              </p>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold font-mono text-[var(--success)]">{correctCount}</div>
              <div className="text-xs text-[var(--text-muted)]">Correct</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold font-mono text-[var(--error)]">{results.length - correctCount}</div>
              <div className="text-xs text-[var(--text-muted)]">Errors</div>
            </div>
            <div className="card text-center">
              <div className={`text-2xl font-bold font-mono ${accuracy === 100 ? 'text-[var(--success)]' : 'text-[var(--primary)]'}`}>
                {accuracy}%
              </div>
              <div className="text-xs text-[var(--text-muted)]">Accuracy</div>
            </div>
          </div>

          {/* Digit-by-digit results */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Digit-by-Digit Results
            </h3>
            <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-x-auto">
              <div className="flex flex-wrap gap-1">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center"
                    title={result.correct ? `Position ${i + 1}: Correct` : `Position ${i + 1}: Expected ${result.expected}, typed ${result.typed}`}
                  >
                    <span className="text-[10px] text-[var(--text-muted)] font-mono mb-0.5">
                      {i + 1}
                    </span>
                    <span className={`
                      w-8 h-8 flex items-center justify-center rounded font-mono font-bold text-sm
                      ${result.correct 
                        ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30' 
                        : 'bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30'
                      }
                    `}>
                      {result.typed}
                    </span>
                    {!result.correct && (
                      <span className="text-[10px] text-[var(--success)] font-mono mt-0.5">
                        {result.expected}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
            <button onClick={startTest} className="btn btn-secondary gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            {isPerfect && (
              <button onClick={downloadCertificate} className="btn btn-primary gap-2">
                <Download className="w-4 h-4" />
                Download Certificate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
