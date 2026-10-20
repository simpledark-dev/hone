import { ChartColumn, ChevronRight, Download, Flame, Share, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { SkillIcon } from '../components/ui/SkillIcon';
import { isIos, isStandalone, useInstallPrompt } from '../hooks/useInstallPrompt';
import { EXERCISE_BLURB, EXERCISE_LABEL } from '../lib/difficulty';
import { estimatedMinutes, roundsFor } from '../lib/session';
import { overview, percent, skillStats } from '../lib/stats';
import { EXERCISE_TYPES } from '../lib/types';
import { useAppStore } from '../store/useAppStore';

const HINT_KEY = 'hone.installHintDismissed';

export default function Home() {
  const navigate = useNavigate();
  const history = useAppStore((s) => s.history);
  const levels = useAppStore((s) => s.progress.levels);
  const stats = overview(history);

  return (
    <Screen>
      <header className="flex items-center justify-between pb-2 pt-5">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">Hone</h1>
        <Link
          to="/stats"
          aria-label="Progress"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 active:bg-surface-2"
        >
          <ChartColumn size={20} strokeWidth={2.2} />
        </Link>
      </header>

      <Card className="mt-3 animate-rise">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-2">Today</p>
            <p className="mt-1 text-lg font-extrabold leading-tight text-ink">
              {stats.todayCount === 0
                ? 'No session yet'
                : `${stats.todayCount} session${stats.todayCount === 1 ? '' : 's'} · best ${stats.todayBest}`}
            </p>
            <p className="mt-1 text-sm text-ink-2">
              {stats.sessions === 0
                ? 'A session takes about four minutes.'
                : `All-time best ${stats.best} · ${stats.sessions} session${stats.sessions === 1 ? '' : 's'}`}
            </p>
          </div>
          {stats.dayStreak > 0 && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-sm font-bold text-amber">
              <Flame size={16} strokeWidth={2.4} />
              {stats.dayStreak}
            </span>
          )}
        </div>
        <Button full className="mt-5" onClick={() => navigate('/train?mode=mixed')}>
          Start session
        </Button>
        <p className="mt-2 text-center text-xs font-semibold text-ink-3">
          {roundsFor('mixed')} rounds · about {estimatedMinutes('mixed')} minutes
        </p>
      </Card>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-2">Practice one skill</h2>
        <div className="space-y-2">
          {EXERCISE_TYPES.map((type) => {
            const skill = skillStats(history, type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => navigate(`/train?mode=${type}`)}
                className="flex w-full items-center gap-3 rounded-card border border-line bg-surface p-4 text-left shadow-card transition-transform active:scale-[0.99]"
              >
                <SkillIcon type={type} />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-ink">{EXERCISE_LABEL[type]}</span>
                  <span className="block truncate text-sm text-ink-2">
                    {skill.rounds > 0 ? `${percent(skill.accuracy)} recent accuracy` : EXERCISE_BLURB[type]}
                  </span>
                </span>
                <span className="tabular shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-ink-2">Lv {levels[type]}</span>
                <ChevronRight size={18} className="shrink-0 text-ink-3" />
              </button>
            );
          })}
        </div>
      </section>

      <InstallHint />
      <div className="h-6" />
    </Screen>
  );
}

function InstallHint() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(HINT_KEY) === '1';
    } catch {
      return false;
    }
  });
  if (dismissed || isStandalone()) return null;
  const ios = isIos();
  if (!ios && !canInstall) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      // Storage unavailable; the hint simply returns next time.
    }
  };

  return (
    <Card className="relative mt-6 bg-accent-soft/60 pr-10">
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="absolute right-3 top-3 p-1 text-ink-3">
        <X size={18} />
      </button>
      <p className="text-sm font-extrabold text-ink">Install for the full-screen experience</p>
      {ios ? (
        <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-ink-2">
          Tap <Share size={15} className="inline" /> Share, then <span className="font-bold">Add to Home Screen</span>.
        </p>
      ) : (
        <Button size="sm" className="mt-3" onClick={install}>
          <Download size={16} /> Install app
        </Button>
      )}
    </Card>
  );
}
