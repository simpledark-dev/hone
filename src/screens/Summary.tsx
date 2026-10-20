import { Check, Trophy, X } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { SkillIcon } from '../components/ui/SkillIcon';
import { cx } from '../lib/cx';
import { EXERCISE_LABEL } from '../lib/difficulty';
import { formatDuration, formatSeconds } from '../lib/scoring';
import { percent } from '../lib/stats';
import { useAppStore } from '../store/useAppStore';
import { useSessionStore } from '../store/useSessionStore';

export default function Summary() {
  const navigate = useNavigate();
  const record = useSessionStore((s) => s.lastRecord);
  const history = useAppStore((s) => s.history);

  if (!record) return <Navigate to="/" replace />;

  const others = history.filter((h) => h.id !== record.id && h.mode === record.mode);
  const previousBest = others.reduce((m, h) => Math.max(m, h.score), 0);
  const isBest = others.length > 0 && record.score > previousBest;
  const correctRounds = record.rounds.filter((r) => r.correct).length;
  const modeLabel = record.mode === 'mixed' ? 'Session' : `${EXERCISE_LABEL[record.mode]} practice`;

  return (
    <Screen>
      <div className="pt-8 text-center animate-rise">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-2">{modeLabel} complete</p>
        <p className="tabular mt-2 text-[64px] font-extrabold leading-none tracking-tight text-ink">{record.score}</p>
        <p className="mt-2 text-sm font-semibold text-ink-2">points</p>
        {isBest ? (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-sm font-bold text-amber">
            <Trophy size={16} strokeWidth={2.4} /> New best
          </span>
        ) : previousBest > 0 ? (
          <p className="mt-3 text-sm font-semibold text-ink-3">Best {previousBest}</p>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Stat label="Accuracy" value={percent(record.accuracy)} />
        <Stat label="Time" value={formatDuration(record.durationMs)} />
        <Stat label="Rounds" value={`${correctRounds}/${record.rounds.length}`} />
      </div>

      <Card className="mt-4 p-2">
        <ul className="divide-y divide-line">
          {record.rounds.map((r, i) => (
            <li key={r.exerciseId} className="flex items-center gap-3 px-2 py-2.5">
              <SkillIcon type={r.type} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">
                  {i + 1}. {EXERCISE_LABEL[r.type]}
                </span>
                <span className="block text-xs text-ink-2">
                  Level {r.level} · {formatSeconds(r.timeMs)}
                </span>
              </span>
              <span className="tabular text-sm font-extrabold text-ink-2">+{r.score}</span>
              <span
                className={cx(
                  'flex h-7 w-7 items-center justify-center rounded-full',
                  r.correct ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
                )}
              >
                {r.correct ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-auto space-y-2 pb-4 pt-6">
        <Button full onClick={() => navigate(`/train?mode=${record.mode}`, { replace: true })}>
          Train again
        </Button>
        <Button full variant="secondary" onClick={() => navigate('/', { replace: true })}>
          Home
        </Button>
      </div>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-3 py-3 text-center shadow-card">
      <p className="tabular text-xl font-extrabold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-2">{label}</p>
    </div>
  );
}
