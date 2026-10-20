import type { ExerciseType, RoundResult, SessionRecord } from './types';

export function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface Overview {
  sessions: number;
  best: number;
  avgAccuracy: number;
  totalMs: number;
  todayCount: number;
  todayBest: number;
  dayStreak: number;
  recent: SessionRecord[];
}

export function overview(history: SessionRecord[], now = Date.now()): Overview {
  const sessions = history.length;
  const best = history.reduce((m, s) => Math.max(m, s.score), 0);
  const avgAccuracy = sessions ? history.reduce((a, s) => a + s.accuracy, 0) / sessions : 0;
  const totalMs = history.reduce((a, s) => a + s.durationMs, 0);
  const today = history.filter((s) => isSameDay(s.endedAt, now));
  return {
    sessions,
    best,
    avgAccuracy,
    totalMs,
    todayCount: today.length,
    todayBest: today.reduce((m, s) => Math.max(m, s.score), 0),
    dayStreak: dayStreak(history, now),
    recent: history.slice(-10).reverse(),
  };
}

/** Consecutive days (ending today or yesterday) with at least one session. */
export function dayStreak(history: SessionRecord[], now = Date.now()): number {
  if (history.length === 0) return 0;
  const days = new Set(history.map((s) => startOfDay(s.endedAt)));
  const dayMs = 24 * 60 * 60 * 1000;
  let cursor = startOfDay(now);
  if (!days.has(cursor)) {
    cursor -= dayMs;
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor -= dayMs;
  }
  return streak;
}

export interface SkillStats {
  rounds: number;
  /** Slot-level accuracy over the most recent rounds, 0..1. */
  accuracy: number;
  avgTimeMs: number;
  recentResults: RoundResult[];
}

export function skillStats(history: SessionRecord[], type: ExerciseType, window = 20): SkillStats {
  const all = history.flatMap((s) => s.rounds).filter((r) => r.type === type);
  const recent = all.slice(-window);
  const slots = recent.reduce((a, r) => a + r.slotsTotal, 0);
  const correct = recent.reduce((a, r) => a + r.slotsCorrect, 0);
  return {
    rounds: all.length,
    accuracy: slots ? correct / slots : 0,
    avgTimeMs: recent.length ? recent.reduce((a, r) => a + r.timeMs, 0) / recent.length : 0,
    recentResults: recent,
  };
}

export function relativeDay(ts: number, now = Date.now()): string {
  if (isSameDay(ts, now)) return 'Today';
  if (isSameDay(ts, now - 24 * 60 * 60 * 1000)) return 'Yesterday';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function percent(v: number): string {
  return `${Math.round(v * 100)}%`;
}
