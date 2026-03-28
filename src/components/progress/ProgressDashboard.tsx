import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GOAL_META } from '../../types';

function StatCard({ label, value, unit, color, emoji }: {
  label: string; value: string | number; unit?: string; color: string; emoji: string;
}) {
  return (
    <div className={`glass p-4 rounded-2xl relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 rounded-2xl`} />
      <div className="relative">
        <div className="text-2xl mb-2">{emoji}</div>
        <div className="text-white font-bold text-2xl leading-none">
          {value}<span className="text-sm font-normal text-white/50 ml-1">{unit}</span>
        </div>
        <div className="text-white/50 text-xs mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function ProgressDashboard() {
  const { progressHistory, records, plan, profile } = useApp();

  const stats = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeek = progressHistory.filter(e => new Date(e.date) >= weekAgo);
    const totalVolume = thisWeek.reduce((sum, e) => sum + e.totalVolume, 0);
    const uniqueExercises = new Set(thisWeek.map(e => e.exerciseName)).size;

    const workoutDays = plan?.days.filter(d => !d.isRestDay) ?? [];
    const completedDays = workoutDays.filter(d => d.completed).length;
    const completionRate = workoutDays.length > 0
      ? Math.round((completedDays / workoutDays.length) * 100)
      : 0;

    // Group by exercise for per-exercise volume
    const byExercise: Record<string, number[]> = {};
    progressHistory.forEach(e => {
      if (!byExercise[e.exerciseName]) byExercise[e.exerciseName] = [];
      byExercise[e.exerciseName].push(e.maxWeight);
    });

    return {
      totalVolume: Math.round(totalVolume / 1000), // to tonnes
      uniqueExercises,
      completionRate,
      completedDays,
      totalDays: workoutDays.length,
      totalSessions: progressHistory.length,
    };
  }, [progressHistory, plan]);

  const recordsList = Object.values(records).sort((a, b) => b.weight - a.weight).slice(0, 10);

  const goalMeta = profile ? GOAL_META[profile.goal] : null;

  // Weekly completion ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.completionRate / 100) * circumference;

  // Get last 7 days activity
  const last7Days = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entries = progressHistory.filter(e => e.date.startsWith(dateStr));
      result.push({
        date,
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        count: entries.length,
        volume: entries.reduce((s, e) => s + e.totalVolume, 0),
      });
    }
    return result;
  }, [progressHistory]);

  const maxVolume = Math.max(...last7Days.map(d => d.volume), 1);

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pb-6 animate-fade-in">
      <div className="pt-2 pb-4">
        <h2 className="text-white font-bold text-xl">Your Progress</h2>
        <p className="text-white/40 text-sm">Track your fitness journey</p>
      </div>

      {/* Profile summary */}
      {profile && goalMeta && (
        <div className="glass p-4 rounded-2xl mb-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goalMeta.gradient} flex items-center justify-center text-2xl shadow-lg`}>
            {goalMeta.emoji}
          </div>
          <div className="flex-1">
            <div className="text-white font-bold">{profile.name}</div>
            <div className="text-white/40 text-xs">{goalMeta.label} · {profile.experience} · {profile.age}yr</div>
            <div className="text-white/30 text-xs mt-0.5">
              {profile.height}cm · {profile.weight}kg · BMI {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-lg">{profile.workoutsPerWeek}x</div>
            <div className="text-white/30 text-xs">per week</div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="This Week Volume" value={stats.totalVolume} unit="t" color="from-violet-600 to-purple-800" emoji="⚡" />
        <StatCard label="Exercises Done" value={stats.uniqueExercises} unit="types" color="from-blue-600 to-cyan-800" emoji="🎯" />
        <StatCard label="Week Completion" value={`${stats.completionRate}`} unit="%" color="from-green-600 to-teal-800" emoji="✅" />
        <StatCard label="Total Sessions" value={stats.totalSessions} color="from-orange-600 to-amber-800" emoji="🔥" />
      </div>

      {/* Weekly completion ring + day breakdown */}
      <div className="glass p-4 rounded-2xl mb-4">
        <div className="flex items-center gap-6">
          {/* Ring */}
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <svg className="progress-ring absolute w-24 h-24">
              <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                cx="48" cy="48" r={radius} fill="none"
                stroke="url(#progRing2)"
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="progress-ring-fill"
              />
              <defs>
                <linearGradient id="progRing2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
            <div className="relative text-center">
              <div className="text-white font-bold text-xl leading-none">{stats.completionRate}%</div>
              <div className="text-white/30 text-[9px]">complete</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold mb-1">Weekly Goal</div>
            <div className="text-white/40 text-xs mb-3">
              {stats.completedDays} of {stats.totalDays} workout days completed
            </div>
            {/* Mini day dots */}
            {plan && (
              <div className="flex gap-1.5">
                {plan.days.map(day => (
                  <div
                    key={day.dayIndex}
                    title={day.dayName}
                    className={`flex-1 h-1.5 rounded-full ${
                      day.isRestDay
                        ? 'bg-white/10'
                        : day.completed
                          ? 'bg-green-400'
                          : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-between mt-1">
              {plan?.days.map(d => (
                <span key={d.dayIndex} className="text-white/20 text-[8px] flex-1 text-center">
                  {d.dayName.slice(0, 1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7-day volume bars */}
      <div className="glass p-4 rounded-2xl mb-4">
        <div className="text-white font-semibold text-sm mb-3">Last 7 Days</div>
        <div className="flex items-end gap-2 h-20">
          {last7Days.map((day, i) => {
            const heightPct = maxVolume > 0 ? (day.volume / maxVolume) * 100 : 0;
            const isToday = i === 6;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isToday ? 'bg-gradient-to-t from-violet-600 to-violet-400' :
                      day.count > 0 ? 'bg-white/25' : 'bg-white/[0.05]'
                    }`}
                    style={{ height: `${Math.max(heightPct, day.count > 0 ? 8 : 4)}%` }}
                  />
                </div>
                <span className={`text-[9px] font-medium ${isToday ? 'text-violet-400' : 'text-white/30'}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Records */}
      {recordsList.length > 0 && (
        <div className="glass p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏆</span>
            <span className="text-white font-semibold text-sm">Personal Records</span>
          </div>
          <div className="space-y-2">
            {recordsList.map((record, i) => (
              <div key={record.exerciseName} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04]">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                      i === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' :
                        i === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(255,255,255,0.1)',
                    color: i < 3 ? '#1a1a2e' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{record.exerciseName}</div>
                  <div className="text-white/30 text-[10px]">
                    {new Date(record.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-sm">
                    {record.weight > 0 ? `${record.weight}kg` : 'BW'}
                  </div>
                  <div className="text-white/40 text-xs">{record.reps} reps</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {progressHistory.length === 0 && (
        <div className="glass p-8 rounded-2xl text-center mt-4">
          <div className="text-4xl mb-3">📊</div>
          <div className="text-white/60 font-semibold">No data yet</div>
          <div className="text-white/30 text-sm mt-1">Complete a workout to see your progress here</div>
        </div>
      )}
    </div>
  );
}
