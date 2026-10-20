import { useCallback, useRef, useState } from 'react';
import { letterAudio } from '../../lib/audio/engine';
import { scoreRound } from '../../lib/scoring';
import type { Exercise, RoundResult } from '../../lib/types';
import { useAppStore } from '../../store/useAppStore';

/**
 * Shared answer-entry state for every exercise: the active slot, digit
 * input, timing from `startTimer()` to submit, scoring and feedback.
 */
export function useRound(exercise: Exercise, onFinish: (result: RoundResult) => void) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState(exercise.slots[0]!.id);
  const [result, setResult] = useState<RoundResult | null>(null);
  const startedAt = useRef<number | null>(null);
  const sound = useAppStore((s) => s.settings.sound);

  const startTimer = useCallback(() => {
    if (startedAt.current === null) startedAt.current = performance.now();
  }, []);

  const digit = useCallback(
    (d: string) => {
      setValues((v) => {
        const cur = v[activeId] ?? '';
        if (cur.length >= 2) return v;
        return { ...v, [activeId]: cur === '0' ? d : cur + d };
      });
    },
    [activeId],
  );

  const backspace = useCallback(() => {
    setValues((v) => ({ ...v, [activeId]: (v[activeId] ?? '').slice(0, -1) }));
  }, [activeId]);

  const complete = exercise.slots.every((s) => (values[s.id] ?? '') !== '');

  const submit = useCallback(() => {
    if (!complete || result) return;
    const now = performance.now();
    const timeMs = Math.round(now - (startedAt.current ?? now));
    const given = exercise.slots.map((s) => parseInt(values[s.id] ?? '0', 10));
    const r = scoreRound({ exercise, given, timeMs });
    setResult(r);
    letterAudio.soundEffects = sound;
    void letterAudio.unlock().then(() => letterAudio.playTone(r.correct ? 'correct' : 'wrong'));
    if (typeof navigator.vibrate === 'function') navigator.vibrate(r.correct ? 12 : [30, 40, 30]);
  }, [complete, result, exercise, values, sound]);

  const next = useCallback(() => {
    if (result) onFinish(result);
  }, [result, onFinish]);

  return { values, activeId, setActiveId, digit, backspace, complete, submit, result, next, startTimer };
}
