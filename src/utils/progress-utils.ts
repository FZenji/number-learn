
export interface ProgressData {
  digitsLearned: number;
  currentStreak: number;
  bestStreak: number;
  totalPracticeTime: number;
  lastPracticeDate: string | null; // ISO date string or Date string
  bestAccuracy?: number;
  bestDpm?: number;
}

export function updateProgress(numberId: string, updates: { 
  digitsLearned?: number; 
  practiceTime?: number;
  accuracy?: number;
  dpm?: number;
}) {
  const storageKey = `progress-${numberId}`;
  const saved = localStorage.getItem(storageKey);
  
  const progress: ProgressData = saved ? JSON.parse(saved) : {
    digitsLearned: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalPracticeTime: 0,
    lastPracticeDate: null,
  };

  // Update digits learned (keep highest)
  if (updates.digitsLearned !== undefined) {
    progress.digitsLearned = Math.max(progress.digitsLearned, updates.digitsLearned);
  }

  // Update practice time
  if (updates.practiceTime !== undefined) {
    progress.totalPracticeTime += updates.practiceTime;
  }

  // Update best accuracy/dpm
  if (updates.accuracy !== undefined) {
    progress.bestAccuracy = Math.max(progress.bestAccuracy || 0, updates.accuracy);
  }
  if (updates.dpm !== undefined) {
    progress.bestDpm = Math.max(progress.bestDpm || 0, updates.dpm);
  }

  // Update Streak
  const now = new Date();
  const today = now.toDateString();
  
  if (progress.lastPracticeDate) {
    const lastDate = new Date(progress.lastPracticeDate);
    const lastDayString = lastDate.toDateString();
    
    if (lastDayString !== today) {
      // It's a different day. Check if it was yesterday.
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (lastDayString === yesterdayString) {
        // Continued streak!
        progress.currentStreak += 1;
      } else {
        // Broken streak. Reset to 1.
        progress.currentStreak = 1;
      }
    }
    // Else: already practiced today, keep current streak
  } else {
    // First time practicing
    progress.currentStreak = 1;
  }

  progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
  progress.lastPracticeDate = today;

  localStorage.setItem(storageKey, JSON.stringify(progress));
  
  // Trigger a custom event so other panels can update if needed
  window.dispatchEvent(new CustomEvent('progress-updated', { detail: { numberId, progress } }));
  
  return progress;
}
