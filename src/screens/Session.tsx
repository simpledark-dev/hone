import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExerciseView } from '../components/exercises/ExerciseView';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Screen } from '../components/ui/Screen';
import { TopBar } from '../components/ui/TopBar';
import { letterAudio } from '../lib/audio/engine';
import { EXERCISE_TYPES, type RoundResult, type SessionMode } from '../lib/types';
import { useAppStore } from '../store/useAppStore';
import { useSessionStore } from '../store/useSessionStore';

function parseMode(raw: string | null): SessionMode {
  return raw && (EXERCISE_TYPES as string[]).includes(raw) ? (raw as SessionMode) : 'mixed';
}

export default function Session() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = parseMode(params.get('mode'));
  const status = useSessionStore((s) => s.status);
  const sessionMode = useSessionStore((s) => s.mode);
  const exercise = useSessionStore((s) => s.current);
  const index = useSessionStore((s) => s.index);
  const total = useSessionStore((s) => s.plan.length);
  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    const s = useSessionStore.getState();
    if (s.status !== 'running' || s.mode !== mode) {
      s.start(mode, useAppStore.getState().progress.levels);
    }
  }, [mode]);

  const handleFinish = useCallback(
    (result: RoundResult) => {
      const app = useAppStore.getState();
      app.applyRound(result.type, result);
      const record = useSessionStore.getState().complete(result, useAppStore.getState().progress.levels);
      if (record) {
        app.addSession(record);
        navigate('/summary', { replace: true });
      }
    },
    [navigate],
  );

  const endSession = () => {
    letterAudio.stop();
    useSessionStore.getState().abandon();
    navigate('/', { replace: true });
  };

  if (status !== 'running' || sessionMode !== mode || !exercise) return <Screen fixed>{null}</Screen>;

  return (
    <Screen fixed>
      <TopBar index={index} total={total} level={exercise.level} onClose={() => setConfirmEnd(true)} />
      <main key={exercise.id} className="flex min-h-0 flex-1 flex-col animate-pop">
        <ExerciseView exercise={exercise} last={index === total - 1} onFinish={handleFinish} />
      </main>
      <ConfirmDialog
        open={confirmEnd}
        title="End this session?"
        body="Progress from this session will not be saved."
        confirmLabel="End session"
        danger
        onConfirm={endSession}
        onCancel={() => setConfirmEnd(false)}
      />
    </Screen>
  );
}
