import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateWeeklyPlan } from '../../services/planGenerator';
import DayCard from './DayCard';

export default function WeeklyPlanView() {
  const { plan, profile, setPlan, setActiveTab } = useApp();
  const [regenerating, setRegenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (!plan || !profile) return null;

  const completedDays = plan.days.filter(d => !d.isRestDay && d.completed).length;
  const totalWorkoutDays = plan.days.filter(d => !d.isRestDay).length;
  const completionPct = totalWorkoutDays > 0 ? Math.round((completedDays / totalWorkoutDays) * 100) : 0;

  // Get today's day
  const todayIndex = (new Date().getDay() + 6) % 7; // 0=Mon
  const todayPlan = plan.days.find(d => d.dayIndex === todayIndex);

  async function handleRegenerate() {
    if (!profile) return;
    setRegenerating(true);
    try {
      const newPlan = await generateWeeklyPlan(profile);
      setPlan(newPlan);
    } finally {
      setRegenerating(false);
    }
  }

  // Progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pb-4 animate-fade-in">
      {/* Week header */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <div>
          <h2 className="text-white font-bold text-xl">{plan.weekLabel}</h2>
          <p className="text-white/40 text-sm">{completedDays}/{totalWorkoutDays} workouts done</p>
        </div>
        {/* Progress ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="progress-ring w-16 h-16 absolute">
            <circle
              cx="32" cy="32" r={radius}
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"
            />
            <circle
              cx="32" cy="32" r={radius}
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="progress-ring-fill"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white font-bold text-sm relative">{completionPct}%</span>
        </div>
      </div>

      {/* Today's highlight */}
      {todayPlan && !todayPlan.isRestDay && !todayPlan.completed && (
        <button
          onClick={() => setActiveTab('workout')}
          className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-700/30 to-orange-800/30 border border-amber-500/25 text-left glass-hover animate-slide-up"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Today</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <div className="text-white font-bold">{todayPlan.focus}</div>
              <div className="text-white/50 text-sm">{todayPlan.exercises.length} exercises</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </button>
      )}

      {/* Days grid */}
      <div className="space-y-3">
        {plan.days.map((day) => (
          <DayCard
            key={day.dayIndex}
            day={day}
            isToday={day.dayIndex === todayIndex}
            expanded={expandedDay === day.dayIndex}
            onToggle={() => setExpandedDay(expandedDay === day.dayIndex ? null : day.dayIndex)}
          />
        ))}
      </div>

      {/* Regenerate button */}
      <button
        onClick={handleRegenerate}
        disabled={regenerating}
        className="w-full mt-5 py-3.5 rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
      >
        {regenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Regenerating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate Plan
          </>
        )}
      </button>
    </div>
  );
}
