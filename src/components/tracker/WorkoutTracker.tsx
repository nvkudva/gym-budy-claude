import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { WorkoutDay, DailyExercise, WorkoutSet } from '../../types';
import { DAY_GRADIENTS, DAY_ACCENT_COLORS } from '../../types';

const CATEGORY_EMOJI: Record<string, string> = {
  chest: '🫁', back: '🦅', shoulders: '🏔️', biceps: '💪', triceps: '🦾',
  legs: '🦵', glutes: '🍑', core: '⚡', cardio: '🏃', 'full-body': '🌟',
};

export default function WorkoutTracker() {
  const { plan, setPlan, addProgress, updateRecord, profile } = useApp();

  // Figure out today's day (0=Mon)
  const todayIndex = (new Date().getDay() + 6) % 7;

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayIndex);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  if (!plan || !profile) return null;

  const selectedDay = plan.days.find(d => d.dayIndex === selectedDayIndex) ?? plan.days[0];
  const workoutDays = plan.days.filter(d => !d.isRestDay);

  function completeSet(dayIndex: number, exerciseId: string, setNumber: number, weight: number, reps: number) {
    const updatedDays = plan!.days.map(day => {
      if (day.dayIndex !== dayIndex) return day;
      const updatedExercises: DailyExercise[] = day.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const updatedSets: WorkoutSet[] = ex.sets.map(s =>
          s.setNumber === setNumber
            ? { ...s, completed: true, weight, actualReps: reps, completedAt: new Date().toISOString() }
            : s
        );
        const allDone = updatedSets.every(s => s.completed);
        return { ...ex, sets: updatedSets, completed: allDone };
      });
      const allExDone = updatedExercises.every(e => e.completed);
      return { ...day, exercises: updatedExercises, completed: allExDone };
    });

    setPlan({ ...plan!, days: updatedDays });

    // Save progress
    const day = plan!.days.find(d => d.dayIndex === dayIndex)!;
    const exercise = day.exercises.find(e => e.id === exerciseId)!;
    const totalVolume = weight * reps;

    addProgress({
      id: `progress-${Date.now()}`,
      date: new Date().toISOString(),
      exerciseName: exercise.name,
      totalVolume,
      maxWeight: weight,
      totalReps: reps,
      sets: 1,
    });

    updateRecord(exercise.name, {
      exerciseName: exercise.name,
      weight,
      reps,
      date: new Date().toISOString(),
    });

    // Start rest timer
    startRestTimer(60);
  }

  function uncompleteSet(dayIndex: number, exerciseId: string, setNumber: number) {
    const updatedDays = plan!.days.map(day => {
      if (day.dayIndex !== dayIndex) return day;
      const updatedExercises = day.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const updatedSets = ex.sets.map(s =>
          s.setNumber === setNumber ? { ...s, completed: false } : s
        );
        return { ...ex, sets: updatedSets, completed: false };
      });
      return { ...day, exercises: updatedExercises, completed: false };
    });
    setPlan({ ...plan!, days: updatedDays });
  }

  function startRestTimer(seconds: number) {
    if (timerInterval) clearInterval(timerInterval);
    setRestTimer(seconds);
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  }

  const gradient = DAY_GRADIENTS[selectedDay.dayIndex % DAY_GRADIENTS.length];
  const accentColor = DAY_ACCENT_COLORS[selectedDay.dayIndex % DAY_ACCENT_COLORS.length];

  const completedCount = selectedDay.exercises.filter(e => e.completed).length;
  const totalCount = selectedDay.exercises.length;

  return (
    <div className="h-full overflow-y-auto no-scrollbar animate-fade-in">
      {/* Day selector */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {plan.days.map(day => {
            const isSelected = day.dayIndex === selectedDayIndex;
            const isToday = day.dayIndex === todayIndex;
            return (
              <button
                key={day.dayIndex}
                onClick={() => setSelectedDayIndex(day.dayIndex)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                  isSelected
                    ? 'bg-violet-500/30 border-violet-400/50 text-violet-200'
                    : 'bg-white/[0.04] border-white/10 text-white/40 hover:text-white/60'
                }`}
              >
                {day.dayName.slice(0, 3)}
                {isToday && <span className="ml-1 text-[9px] text-violet-400">•</span>}
                {day.isRestDay && <span className="ml-1">😴</span>}
                {!day.isRestDay && day.completed && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day header */}
      <div className={`mx-4 mb-4 p-4 rounded-2xl relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg">{selectedDay.dayName}</div>
            <div className={`text-sm ${accentColor}`}>{selectedDay.isRestDay ? 'Rest & Recovery' : selectedDay.focus}</div>
            {!selectedDay.isRestDay && (
              <div className="text-white/40 text-xs mt-1">{completedCount}/{totalCount} exercises</div>
            )}
          </div>
          <div className="text-4xl">{selectedDay.isRestDay ? '😴' : CATEGORY_EMOJI[selectedDay.exercises[0]?.category] || '💪'}</div>
        </div>
        {!selectedDay.isRestDay && totalCount > 0 && (
          <div className="relative mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Rest timer */}
      {restTimer !== null && (
        <div className="mx-4 mb-3 p-3 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">⏱️</span>
            <span className="text-orange-300 text-sm font-medium">Rest Timer</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-orange-200 font-bold text-lg font-mono">{restTimer}s</span>
            <button
              onClick={() => { setRestTimer(null); if (timerInterval) clearInterval(timerInterval); }}
              className="text-orange-400/60 hover:text-orange-300 text-xs"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Rest day */}
      {selectedDay.isRestDay && (
        <div className="mx-4 p-6 rounded-2xl glass text-center">
          <div className="text-4xl mb-3">🧘</div>
          <div className="text-white font-semibold text-lg mb-1">Rest Day</div>
          <div className="text-white/40 text-sm">Focus on recovery, stretching, and hydration. Your muscles grow during rest!</div>
        </div>
      )}

      {/* Exercises */}
      {!selectedDay.isRestDay && (
        <div className="px-4 space-y-3 pb-6">
          {selectedDay.exercises.map((exercise, exIdx) => (
            <ExerciseBlock
              key={exercise.id}
              exercise={exercise}
              exIdx={exIdx}
              isActive={activeExerciseId === exercise.id}
              onToggle={() => setActiveExerciseId(activeExerciseId === exercise.id ? null : exercise.id)}
              onCompleteSet={(setNum, weight, reps) =>
                completeSet(selectedDay.dayIndex, exercise.id, setNum, weight, reps)
              }
              onUncompleteSet={(setNum) =>
                uncompleteSet(selectedDay.dayIndex, exercise.id, setNum)
              }
            />
          ))}

          {selectedDay.completed && (
            <div className="p-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-center animate-fade-in">
              <div className="text-2xl mb-1">🎉</div>
              <div className="text-green-300 font-semibold">Workout Complete!</div>
              <div className="text-green-400/60 text-sm">Amazing work today!</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Exercise Block ────────────────────────────────────────────────────────────

interface ExerciseBlockProps {
  exercise: DailyExercise;
  exIdx: number;
  isActive: boolean;
  onToggle: () => void;
  onCompleteSet: (setNum: number, weight: number, reps: number) => void;
  onUncompleteSet: (setNum: number) => void;
}

function ExerciseBlock({ exercise, exIdx, isActive, onToggle, onCompleteSet, onUncompleteSet }: ExerciseBlockProps) {
  const [setWeights, setSetWeights] = useState<Record<number, string>>({});
  const [setReps, setSetReps] = useState<Record<number, string>>({});

  const completedSets = exercise.sets.filter(s => s.completed).length;

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
      exercise.completed ? 'border-green-500/30' : 'border-white/10'
    }`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full p-4 text-left flex items-center justify-between transition-colors ${
          exercise.completed ? 'bg-green-500/10' : 'bg-white/[0.05]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            exercise.completed ? 'bg-green-500/30 text-green-300' : 'bg-white/10 text-white/60'
          }`}>
            {exercise.completed ? '✓' : exIdx + 1}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{exercise.name}</div>
            <div className="text-white/40 text-xs">
              {exercise.sets.length} sets · {exercise.sets[0]?.plannedReps} reps
              {exercise.sets[0]?.weight > 0 ? ` · ${exercise.sets[0].weight}kg` : ' · bodyweight'}
              {' · '}{completedSets}/{exercise.sets.length} done
            </div>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-white/30 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Sets */}
      {isActive && (
        <div className="bg-black/20 border-t border-white/[0.06] animate-fade-in">
          {exercise.notes && (
            <div className="px-4 py-2 text-white/30 text-xs italic border-b border-white/[0.06]">
              💡 {exercise.notes}
            </div>
          )}
          <div className="p-3 space-y-2">
            {/* Column headers */}
            <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-2 px-1">
              <span className="text-white/30 text-[10px] font-medium uppercase">Set</span>
              <span className="text-white/30 text-[10px] font-medium uppercase">Weight (kg)</span>
              <span className="text-white/30 text-[10px] font-medium uppercase">Reps</span>
              <span className="text-white/30 text-[10px] font-medium uppercase">Done</span>
            </div>
            {exercise.sets.map(set => (
              <div key={set.setNumber} className={`grid grid-cols-[40px_1fr_1fr_48px] gap-2 items-center p-2 rounded-xl transition-colors ${
                set.completed ? 'bg-green-500/10' : 'bg-white/[0.03]'
              }`}>
                <span className="text-white/50 text-sm font-semibold">{set.setNumber}</span>
                <input
                  type="number"
                  className="input-glass py-1.5 text-sm text-center"
                  value={setWeights[set.setNumber] ?? (set.completed ? set.weight : set.weight || '')}
                  onChange={e => setSetWeights(prev => ({ ...prev, [set.setNumber]: e.target.value }))}
                  placeholder={set.weight > 0 ? `${set.weight}` : '0'}
                  disabled={set.completed}
                />
                <input
                  type="number"
                  className="input-glass py-1.5 text-sm text-center"
                  value={setReps[set.setNumber] ?? (set.completed ? set.actualReps ?? set.plannedReps : set.plannedReps || '')}
                  onChange={e => setSetReps(prev => ({ ...prev, [set.setNumber]: e.target.value }))}
                  placeholder={`${set.plannedReps}`}
                  disabled={set.completed}
                />
                {set.completed ? (
                  <button
                    onClick={() => onUncompleteSet(set.setNumber)}
                    className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const w = Number(setWeights[set.setNumber] ?? set.weight ?? 0);
                      const r = Number(setReps[set.setNumber] ?? set.plannedReps);
                      onCompleteSet(set.setNumber, w, r);
                    }}
                    className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 flex items-center justify-center hover:bg-violet-500/30 hover:border-violet-400/50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
