'use client';

import { useState, useMemo, useCallback } from 'react';
import { MATH_CONSTANTS, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { RefreshCw, Check, X } from 'lucide-react';

interface RecallTestPanelProps {
  numberId: string;
}

type QuestionType = 'position' | 'next-digit' | 'sequence';

interface Question {
  type: QuestionType;
  prompt: string;
  answer: string;
  position?: number;
}

export function RecallTestPanel({ numberId }: RecallTestPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [questionType, setQuestionType] = useState<QuestionType>('position');
  const [maxPosition, setMaxPosition] = useState(50);
  const [sequenceLength, setSequenceLength] = useState(5);
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const number = useMemo(() => {
    const builtIn = MATH_CONSTANTS.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const digits = useMemo(() => {
    if (!number) return '';
    return number ? getDigitsOnly(number) : '';
  }, [number]);

  const generateQuestion = useCallback(() => {
    if (!digits) return;

    const safeMax = Math.min(maxPosition, digits.length);
    
    if (questionType === 'position') {
      const pos = Math.floor(Math.random() * safeMax) + 1;
      setQuestion({
        type: 'position',
        prompt: `What digit is at position ${pos}?`,
        answer: digits[pos - 1],
        position: pos,
      });
    } else if (questionType === 'next-digit') {
      const pos = Math.floor(Math.random() * (safeMax - 1)) + 1;
      const shown = digits.slice(pos - 1, pos + 2);
      setQuestion({
        type: 'next-digit',
        prompt: `What comes after "${shown.slice(0, -1)}"?`,
        answer: digits[pos + 1],
        position: pos,
      });
    } else if (questionType === 'sequence') {
      const pos = Math.floor(Math.random() * (safeMax - sequenceLength)) + 1;
      setQuestion({
        type: 'sequence',
        prompt: `Type the ${sequenceLength} digits starting at position ${pos}:`,
        answer: digits.slice(pos - 1, pos - 1 + sequenceLength),
        position: pos,
      });
    }

    setUserAnswer('');
    setFeedback(null);
  }, [digits, questionType, maxPosition, sequenceLength]);

  const checkAnswer = () => {
    if (!question) return;
    
    const isCorrect = userAnswer.trim() === question.answer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (feedback) {
        generateQuestion();
      } else if (userAnswer) {
        checkAnswer();
      }
    }
  };

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Recall Test - {number.name}
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--text-muted)]">
            Score: <span className="font-mono text-[var(--success)]">{score.correct}</span>
            /<span className="font-mono">{score.total}</span>
          </span>
          {score.total > 0 && (
            <span className="text-[var(--text-muted)]">
              ({Math.round((score.correct / score.total) * 100)}%)
            </span>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="mb-6 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">Question type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="input w-48"
            >
              <option value="position">Digit at position</option>
              <option value="next-digit">Next digit</option>
              <option value="sequence">Type sequence</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">Max position</label>
            <input
              type="number"
              min="10"
              max={digits.length}
              value={maxPosition}
              onChange={(e) => setMaxPosition(Number(e.target.value))}
              className="input w-24"
            />
          </div>
          {questionType === 'sequence' && (
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Sequence length</label>
              <input
                type="number"
                min="3"
                max="20"
                value={sequenceLength}
                onChange={(e) => setSequenceLength(Number(e.target.value))}
                className="input w-24"
              />
            </div>
          )}
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!question ? (
          <button
            onClick={generateQuestion}
            className="btn btn-primary text-lg px-8 py-4"
          >
            Start Test
          </button>
        ) : (
          <div className="w-full max-w-lg text-center">
            <p className="text-2xl mb-8">{question.prompt}</p>
            
            <div className="relative mb-6">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={handleKeyDown}
                className={`
                  input text-center text-3xl font-mono py-4
                  ${feedback === 'correct' ? 'border-[var(--success)] bg-[var(--success)]/10' : ''}
                  ${feedback === 'incorrect' ? 'border-[var(--error)] bg-[var(--error)]/10' : ''}
                `}
                placeholder="?"
                autoFocus
                disabled={feedback !== null}
              />
              {feedback && (
                <div className={`
                  absolute right-4 top-1/2 -translate-y-1/2
                  ${feedback === 'correct' ? 'text-[var(--success)]' : 'text-[var(--error)]'}
                `}>
                  {feedback === 'correct' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                </div>
              )}
            </div>

            {feedback === null ? (
              <button
                onClick={checkAnswer}
                disabled={!userAnswer}
                className="btn btn-primary px-8"
              >
                Check Answer
              </button>
            ) : (
              <div>
                {feedback === 'incorrect' && (
                  <p className="mb-4 text-[var(--error)]">
                    Correct answer: <span className="font-mono font-bold">{question.answer}</span>
                  </p>
                )}
                <button
                  onClick={generateQuestion}
                  className="btn btn-primary px-8"
                >
                  <RefreshCw className="w-4 h-4" />
                  Next Question
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
