'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { NUMBER_BANK, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { updateProgress } from '@/utils/progress-utils';
import { useUser } from '@clerk/nextjs';
import { CheckCircle, RotateCcw, Download, Award, Trophy, BadgeCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const { user } = useUser();
  const { customNumbers } = useWorkspaceStore();
  const [phase, setPhase] = useState<TestPhase>('setup');
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<DigitResult[]>([]);
  const [isPerfect, setIsPerfect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  // Reset state when number changes
  useEffect(() => {
    setPhase('setup');
    setUserInput('');
    setResults([]);
    setIsPerfect(false);
    setShowCelebration(false);
  }, [numberId]);

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
    setIsDownloading(false);
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

    const accuracyVal = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

    // Update progress using central utility
    updateProgress(numberId, {
      digitsLearned: consecutiveCorrect,
      accuracy: accuracyVal,
    });

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

  const downloadCertificate = async () => {
    if (!number || isDownloading) return;
    setIsDownloading(true);
    
    try {
      const element = document.getElementById('certificate-template');
      if (!element) throw new Error('Template not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0a',
        width: 1123,
        height: 794,
        windowWidth: 1123,
        windowHeight: 794
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1123, 794]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);
      
      // Sanitize filename
      const safeNumberName = number.name.replace(/[^a-z0-9]/gi, '_');
      const safeUserName = (user?.fullName || 'User').replace(/[^a-z0-9]/gi, '_');
      const filename = `Certificate-${safeNumberName}-${safeUserName}.pdf`;
      
      pdf.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const dateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  const correctCount = results.filter(r => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }


  const certContainerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#020617', // slate-950
    color: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif'
  } as any;

  return (
    <div className="h-full flex flex-col overflow-y-auto relative">
      {/* Hidden Certificate Template for PDF Generation */}
      <div 
        id="certificate-template"
        className="fixed -left-[4000px] top-0 pointer-events-none"
        style={{ width: '1123px', height: '794px' }}
      >
        <div style={certContainerStyle}>
          {/* Background Elements */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at center, #0f172a, #020617)'
          }} />
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
          }} />
          
          {/* Borders */}
          <div style={{
            position: 'absolute', inset: '32px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }} />
          <div style={{
            position: 'absolute', inset: '40px',
            border: '2px solid rgba(245, 158, 11, 0.8)',
            boxShadow: '0 0 40px rgba(245, 158, 11, 0.1)',
            boxSizing: 'border-box'
          }} />
          
          {/* Corner Decorations */}
          <div style={{ position: 'absolute', top: '40px', left: '40px', width: '64px', height: '64px', borderTop: '4px solid #f59e0b', borderLeft: '4px solid #f59e0b' }} />
          <div style={{ position: 'absolute', top: '40px', right: '40px', width: '64px', height: '64px', borderTop: '4px solid #f59e0b', borderRight: '4px solid #f59e0b' }} />
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', width: '64px', height: '64px', borderBottom: '4px solid #f59e0b', borderLeft: '4px solid #f59e0b' }} />
          <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '64px', height: '64px', borderBottom: '4px solid #f59e0b', borderRight: '4px solid #f59e0b' }} />

          {/* Main Content Container */}
          <div style={{
             position: 'relative', zIndex: 10,
             display: 'flex', flexDirection: 'column',
             alignItems: 'center', justifyContent: 'space-between',
             height: '100%', padding: '64px 80px', // Reduced top/bottom padding to prevent overlap
             textAlign: 'center', width: '100%', maxWidth: '1024px',
             margin: '0 auto'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div style={{
                padding: '16px', borderRadius: '9999px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                marginBottom: '8px'
              }}>
                <Trophy size={64} color="#f59e0b" style={{ filter: 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <h1 style={{
                   fontSize: '60px', fontFamily: 'Playfair Display, serif',
                   color: '#fbbf24', letterSpacing: '0.05em',
                   filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))',
                   margin: 0
                 }}>CERTIFICATE</h1>
                 <p style={{
                   fontSize: '20px', color: 'rgba(245, 158, 11, 0.6)',
                   textTransform: 'uppercase', letterSpacing: '0.5em',
                   fontWeight: 300, margin: 0
                 }}>of Perfection</p>
              </div>
            </div>

            {/* Achievement Text */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', margin: '24px 0' }}>
              <p style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 300, margin: 0 }}>
                This is to certify that <span style={{ color: '#f8fafc', fontWeight: 500 }}>{user?.fullName || user?.firstName || 'the user'}</span> has successfully recalled
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                 <span style={{
                   fontSize: '96px', fontWeight: 700, fontFamily: 'monospace',
                   color: '#ffffff', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))',
                   lineHeight: 1
                 }}>
                   {correctCount}
                 </span>
                 <span style={{ fontSize: '30px', color: 'rgba(254, 243, 199, 0.8)', fontWeight: 300 }}>digits of {number.name}</span>
              </div>
              
              <p style={{ color: '#94a3b8', fontSize: '18px', letterSpacing: '0.025em', margin: 0 }}>
                with <span style={{ color: '#fbbf24', fontWeight: 600 }}>100% accuracy</span>
              </p>
            </div>

            {/* Footer / Signature Area */}
            <div style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              borderTop: '1px solid rgba(30, 41, 59, 0.5)', paddingTop: '24px', marginTop: 'auto', marginBottom: '10px'
            }}>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                 <span style={{ fontFamily: 'monospace', color: 'rgba(245, 158, 11, 0.8)', fontSize: '20px' }}>{dateStr}</span>
                 <span style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Awarded</span>
               </div>

               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.9 }}>
                 <BadgeCheck size={48} color="#f59e0b" />
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.25 }}>
                    <span style={{ color: '#fef3c7', fontWeight: 700, letterSpacing: '0.025em' }}>VERIFIED</span>
                    <span style={{ color: 'rgba(245, 158, 11, 0.6)', fontSize: '12px', textTransform: 'uppercase' }}>Recall Test</span>
                 </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                 <span style={{ fontFamily: 'Playfair Display, serif', color: '#fef3c7', fontSize: '24px', fontStyle: 'italic' }}>Number Learn Studio</span>
                 <span style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>number-learn.xyz</span>
               </div>
            </div>

          </div>
        </div>
      </div>
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
              <br/>Recall all digits correctly to earn a certificate!
              <br/><br/>
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
              <button 
                onClick={downloadCertificate} 
                className="btn btn-primary gap-2"
                disabled={isDownloading}
              >
                {isDownloading ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                   <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Downloading...' : 'Download Certificate'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
