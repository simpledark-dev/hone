import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Screen } from '../components/ui/Screen';
import { SkillIcon } from '../components/ui/SkillIcon';
import { Switch } from '../components/ui/Switch';
import { cx } from '../lib/cx';
import { EXERCISE_LABEL } from '../lib/difficulty';
import { formatDuration, formatSeconds } from '../lib/scoring';
import { overview, percent, relativeDay, skillStats } from '../lib/stats';
import { EXERCISE_TYPES, type SessionRecord } from '../lib/types';
import { useAppStore } from '../store/useAppStore';

export default function Stats() {
  const history = useAppStore((s) => s.history);
  const levels = useAppStore((s) => s.progress.levels);
  const sound = useAppStore((s) => s.settings.sound);
  const setSound = useAppStore((s) => s.setSound);
  const resetAll = useAppStore((s) => s.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);
  const stats = overview(history);

  return (
    <Screen>
      <header className="flex items-center gap-3 pb-2 pt-5">
        <Link
          to="/"
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 active:bg-surface-2"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </Link>
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">Progress</h1>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tile label="Best score" value={String(stats.best)} />
        <Tile label="Sessions" value={String(stats.sessions)} />
        <Tile label="Avg accuracy" value={stats.sessions ? percent(stats.avgAccuracy) : '–'} />
        <Tile label="Time trained" value={stats.totalMs ? formatDuration(stats.totalMs) : '–'} />
      </div>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-2">Recent sessions</h2>
        <Card>
          {stats.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-2">Complete a session to see your scores here.</p>
          ) : (
            <>
              <ScoreChart sessions={stats.recent.slice().reverse()} />
              <ul className="mt-4 divide-y divide-line">
                {stats.recent.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>
                      <span className="block font-bold text-ink">{relativeDay(s.endedAt)}</span>
                      <span className="block text-xs text-ink-2">
                        {s.mode === 'mixed' ? 'Session' : EXERCISE_LABEL[s.mode]} · {percent(s.accuracy)} · {formatDuration(s.durationMs)}
                      </span>
                    </span>
                    <span className="tabular text-base font-extrabold text-ink">{s.score}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-2">Skills</h2>
        <div className="space-y-2">
          {EXERCISE_TYPES.map((type) => {
            const skill = skillStats(history, type);
            return (
              <Card key={type} className="flex items-center gap-3 p-4">
                <SkillIcon type={type} />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-ink">{EXERCISE_LABEL[type]}</span>
                  <span className="block text-sm text-ink-2">
                    {skill.rounds === 0
                      ? 'Not played yet'
                      : `${percent(skill.accuracy)} accuracy · ${formatSeconds(skill.avgTimeMs)} avg · ${skill.rounds} rounds`}
                  </span>
                </span>
                <span className="tabular shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-ink-2">Lv {levels[type]}</span>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-6 pb-8">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-2">Settings</h2>
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-base font-bold text-ink">Sound effects</span>
              <span className="block text-sm text-ink-2">Short tones after each answer.</span>
            </span>
            <Switch checked={sound} onChange={setSound} label="Sound effects" />
          </div>
          <Button variant="danger" size="md" full onClick={() => setConfirmReset(true)}>
            Reset all progress
          </Button>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all progress?"
        body="Levels, scores and history on this device will be deleted."
        confirmLabel="Reset"
        danger
        onConfirm={() => {
          resetAll();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </Screen>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3 shadow-card">
      <p className="tabular text-2xl font-extrabold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-2">{label}</p>
    </div>
  );
}

/** Oldest to newest, one bar per session. Labels only on the latest and best bars. */
function ScoreChart({ sessions }: { sessions: SessionRecord[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const W = 320;
  const H = 120;
  const padTop = 18;
  const padBottom = 6;
  const max = Math.max(1, ...sessions.map((s) => s.score));
  const bestIndex = sessions.findIndex((s) => s.score === max);
  const slot = W / Math.max(sessions.length, 6);
  const barW = Math.min(28, slot - 6);
  const plotH = H - padTop - padBottom;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Scores of recent sessions">
      <line x1="0" x2={W} y1={H - padBottom} y2={H - padBottom} stroke="#e3e7ed" strokeWidth="1" />
      {sessions.map((s, i) => {
        const h = Math.max(4, (s.score / max) * plotH);
        const x = i * slot + (slot - barW) / 2;
        const y = H - padBottom - h;
        const latest = i === sessions.length - 1;
        const labelled = selected === i || (selected === null && (latest || i === bestIndex));
        return (
          <g key={s.id} onClick={() => setSelected(selected === i ? null : i)} className="cursor-pointer">
            <rect x={x - 3} y={padTop - 10} width={barW + 6} height={plotH + 10} fill="transparent" />
            <path
              d={`M${x},${H - padBottom} v${-(h - 4)} a4,4 0 0 1 4,-4 h${barW - 8} a4,4 0 0 1 4,4 v${h - 4} z`}
              fill={latest || selected === i ? '#2b5bd7' : '#a9bdf0'}
            />
            {labelled && (
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#141a24"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {s.score}
              </text>
            )}
          </g>
        );
      })}
      <text x={W} y={H - padBottom - plotH - 6} textAnchor="end" fontSize="10" fontWeight="600" fill="#8e98a8" className={cx(sessions.length < 2 && 'hidden')}>
        last {sessions.length}
      </text>
    </svg>
  );
}
