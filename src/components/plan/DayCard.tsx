import type { WorkoutDay } from '../../types';
import { DAY_GRADIENTS, DAY_ACCENT_COLORS } from '../../types';

const CATEGORY_COLORS: Record<string, string> = {
  chest: 'bg-blue-500/20 text-blue-300',
  back: 'bg-green-500/20 text-green-300',
  shoulders: 'bg-orange-500/20 text-orange-300',
  biceps: 'bg-pink-500/20 text-pink-300',
  triceps: 'bg-violet-500/20 text-violet-300',
  legs: 'bg-cyan-500/20 text-cyan-300',
  glutes: 'bg-rose-500/20 text-rose-300',
  core: 'bg-yellow-500/20 text-yellow-300',
  cardio: 'bg-red-500/20 text-red-300',
  'full-body': 'bg-indigo-500/20 text-indigo-300',
};

interface DayCardProps {
  day: WorkoutDay;
  isToday: boolean;
  expanded: boolean;
  onToggle: () => void;
}

export default function DayCard({ day, isToday, expanded, onToggle }: DayCardProps) {
  const gradient = DAY_GRADIENTS[day.dayIndex % DAY_GRADIENTS.length];
  const accentColor = DAY_ACCENT_COLORS[day.dayIndex % DAY_ACCENT_COLORS.length];

  const completedExercises = day.exercises.filter(e => e.completed).length;
  const totalExercises = day.exercises.length;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isToday
          ? 'border-white/25 shadow-lg shadow-violet-500/10'
          : 'border-white/10'
      } ${day.completed ? 'opacity-70' : ''}`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-black/30" />

      {/* Header */}
      <button
        onClick={onToggle}
        className="relative w-full px-4 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {/* Day number */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
            isToday ? 'bg-white text-slate-900' : 'bg-white/10 text-white/80'
          }`}>
            {day.dayName.slice(0, 2)}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{day.dayName}</span>
              {isToday && (
                <span className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Today
                </span>
              )}
              {day.completed && (
                <span className="text-[10px] font-bold text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full">
                  ✓ Done
                </span>
              )}
            </div>
            <div className={`text-xs ${accentColor}`}>
              {day.isRestDay ? '😴 Rest Day' : day.focus}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!day.isRestDay && (
            <span className="text-white/40 text-xs">
              {day.isRestDay ? '' : `${totalExercises} ex`}
            </span>
          )}
          {!day.isRestDay && totalExercises > 0 && (
            <svg
              className={`w-4 h-4 text-white/40 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Exercise mini-progress bar */}
      {!day.isRestDay && totalExercises > 0 && (
        <div className="relative px-4 pb-3">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${(completedExercises / totalExercises) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded exercises */}
      {expanded && !day.isRestDay && (
        <div className="relative px-4 pb-4 space-y-2 animate-fade-in">
          <div className="h-px bg-white/10 mb-3" />
          {day.exercises.map((exercise, idx) => (
            <div
              key={exercise.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                exercise.completed ? 'bg-white/[0.08]' : 'bg-white/[0.04]'
              }`}
            >
              <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                {exercise.completed ? (
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-white/30 text-[9px] font-bold">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium">{exercise.name}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[exercise.category] || 'bg-white/10 text-white/50'}`}>
                    {exercise.category}
                  </span>
                  <span className="text-white/40 text-xs">
                    {exercise.sets.length} sets × {exercise.sets[0]?.plannedReps} reps
                    {exercise.sets[0]?.weight > 0 ? ` @ ${exercise.sets[0].weight}kg` : ''}
                  </span>
                </div>
                {exercise.notes && (
                  <div className="text-white/30 text-xs mt-1 italic">{exercise.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rest day content */}
      {day.isRestDay && (
        <div className="relative px-4 pb-4 text-white/30 text-sm flex items-center gap-2">
          <span>Active recovery, stretching & rest</span>
        </div>
      )}
    </div>
  );
}
