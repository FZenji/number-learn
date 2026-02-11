'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy } from 'lucide-react';

interface ToastData {
  id: string;
  name: string;
  description: string;
}

export function AchievementToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const handleAchievement = useCallback((event: Event) => {
    const detail = (event as CustomEvent).detail as ToastData;
    setToasts(prev => [...prev, detail]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== detail.id));
    }, 5000);
  }, []);

  useEffect(() => {
    window.addEventListener('achievement-unlocked', handleAchievement);
    return () => window.removeEventListener('achievement-unlocked', handleAchievement);
  }, [handleAchievement]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-3" style={{ pointerEvents: 'none' }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] border border-[var(--success)] rounded-xl shadow-lg shadow-[var(--success)]/20"
          style={{
            animation: 'achievement-slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            pointerEvents: 'auto',
          }}
        >
          <div className="p-2 rounded-lg bg-[var(--success)]/20 text-[var(--success)]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--success)]">
              🎉 Achievement Unlocked!
            </div>
            <div className="font-medium">{toast.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{toast.description}</div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes achievement-slide-in {
          0% {
            opacity: 0;
            transform: translateX(-100%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
