'use client';

import { type Tab } from '@/store/workspace-store';
import { DigitDisplayPanel } from '@/components/panels/digit-display-panel';
import { RecallTestPanel } from '@/components/panels/recall-test-panel';
import { PracticePanel } from '@/components/panels/practice-panel';
import { ChunkTrainerPanel } from '@/components/panels/chunk-trainer-panel';
import { ScratchpadPanel } from '@/components/panels/scratchpad-panel';
import { NotesPanel } from '@/components/panels/notes-panel';
import { CanvasPanel } from '@/components/panels/canvas-panel';
import { TimelinePanel } from '@/components/panels/timeline-panel';
import { ProgressPanel } from '@/components/panels/progress-panel';
import { StatisticsPanel } from '@/components/panels/statistics-panel';
import { MajorSystemPanel } from '@/components/panels/major-system-panel';
import { PiemPanel } from '@/components/panels/piem-panel';
import { SequencePanel } from '@/components/panels/sequence-panel';

interface PanelContainerProps {
  tab: Tab;
}

export function PanelContainer({ tab }: PanelContainerProps) {
  const panelComponents: Record<string, React.ComponentType<{ numberId: string }>> = {
    'digit-display': DigitDisplayPanel,
    'recall-test': RecallTestPanel,
    'practice': PracticePanel,
    'chunk-trainer': ChunkTrainerPanel,
    'scratchpad': ScratchpadPanel,
    'notes': NotesPanel,
    'canvas': CanvasPanel,
    'timeline': TimelinePanel,
    'progress': ProgressPanel,
    'statistics': StatisticsPanel,
    'major-system': MajorSystemPanel,
    'piem': PiemPanel,
    'sequence': SequencePanel,
  };

  const PanelComponent = panelComponents[tab.panelType];

  if (!PanelComponent) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
        Unknown panel type: {tab.panelType}
      </div>
    );
  }

  return (
    <div className="h-full animate-fade-in">
      <PanelComponent numberId={tab.numberId} />
    </div>
  );
}
