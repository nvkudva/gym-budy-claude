import { EXERCISES } from '../data/exercises';
import type { ExerciseTemplate } from '../data/exercises';
import type {
  UserProfile, WeeklyPlan, WorkoutDay, DailyExercise, WorkoutSet,
  ExerciseCategory, Equipment,
} from '../types';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** The library has no equipment field, so infer it from the movement name. */
function equipmentOf(name: string): Equipment {
  const n = name.toLowerCase();
  if (n.includes('barbell') || n.includes('deadlift') || n.includes('squat') || n.includes('clean')) return 'barbell';
  if (n.includes('dumbbell')) return 'dumbbells';
  if (n.includes('cable') || n.includes('machine') || n.includes('press-down') || n.includes('lat pulldown') || n.includes('leg press')) return 'machines';
  if (n.includes('band')) return 'resistance-bands';
  return 'bodyweight';
}

/** Rest days are spread so no two sessions run back to back where possible. */
const SPLITS: Record<number, ExerciseCategory[][]> = {
  1: [['chest', 'back', 'legs']],
  2: [['chest', 'shoulders', 'triceps'], ['back', 'biceps', 'legs']],
  3: [['chest', 'shoulders', 'triceps'], ['back', 'biceps'], ['legs', 'glutes', 'core']],
  4: [['chest', 'triceps'], ['back', 'biceps'], ['legs', 'glutes'], ['shoulders', 'core']],
  5: [['chest', 'triceps'], ['back', 'biceps'], ['legs', 'glutes'], ['shoulders', 'core'], ['cardio', 'core']],
  6: [['chest', 'triceps'], ['back', 'biceps'], ['legs', 'glutes'], ['shoulders', 'core'], ['chest', 'back'], ['cardio', 'legs']],
  7: [['chest', 'triceps'], ['back', 'biceps'], ['legs', 'glutes'], ['shoulders', 'core'], ['chest', 'back'], ['cardio', 'legs'], ['core', 'cardio']],
};

const DAY_SLOTS: Record<number, number[]> = {
  1: [2],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 3, 4, 5],
  6: [0, 1, 2, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

const EXPERIENCE_LOAD: Record<string, number> = { beginner: 0.6, intermediate: 1, advanced: 1.2 };

function focusLabel(categories: ExerciseCategory[]): string {
  const pretty = categories.map(c => c.charAt(0).toUpperCase() + c.slice(1));
  return pretty.length > 1 ? `${pretty.slice(0, -1).join(", ")} & ${pretty[pretty.length - 1]}` : pretty[0];
}

function buildSets(template: ExerciseTemplate, loadFactor: number, repBias: number): WorkoutSet[] {
  const weight = Math.round((template.defaultWeight * loadFactor) / 2.5) * 2.5;
  const reps = Math.max(4, Math.round(template.defaultReps * repBias));
  return Array.from({ length: template.defaultSets }, (_, i) => ({
    setNumber: i + 1,
    plannedReps: reps,
    weight,
    completed: false,
  }));
}

/**
 * A deterministic plan built from the local exercise library. Used when no AI
 * provider is configured, so onboarding always ends with a usable plan rather
 * than a fetch error.
 */
export function buildStarterPlan(profile: UserProfile): WeeklyPlan {
  const sessions = Math.min(7, Math.max(1, profile.workoutsPerWeek));
  const split = SPLITS[sessions] ?? SPLITS[3];
  const slots = DAY_SLOTS[sessions] ?? DAY_SLOTS[3];

  const allowed = profile.equipment.length ? profile.equipment : (['bodyweight'] as Equipment[]);
  const available = EXERCISES.filter(e => allowed.includes(equipmentOf(e.name)));
  const pool = available.length >= 12 ? available : EXERCISES;

  const loadFactor = EXPERIENCE_LOAD[profile.experience] ?? 1;
  // Endurance and weight-loss goals favour higher reps at lighter loads.
  const enduranceGoal = profile.goal === 'endurance' || profile.goal === 'running' || profile.goal === 'weight-loss';
  const repBias = enduranceGoal ? 1.4 : profile.goal === 'strength' ? 0.7 : 1;
  const strengthGoal = profile.goal === 'strength';

  const used = new Set<string>();

  const days: WorkoutDay[] = DAY_NAMES.map((dayName, dayIndex) => {
    const sessionIndex = slots.indexOf(dayIndex);
    if (sessionIndex === -1) {
      return { dayIndex, dayName, focus: 'Rest Day', exercises: [], isRestDay: true, completed: false };
    }

    const categories = split[sessionIndex];
    const picks: ExerciseTemplate[] = [];
    for (const category of categories) {
      const candidates = pool.filter(e => e.category === category && !used.has(e.name));
      const take = categories.length <= 2 ? 2 : 2;
      for (const c of candidates.slice(0, take)) {
        used.add(c.name);
        picks.push(c);
      }
    }
    // A category can run dry on a bodyweight-only profile; top up from the pool.
    if (picks.length < 3) {
      for (const c of pool.filter(e => !used.has(e.name)).slice(0, 3 - picks.length)) {
        used.add(c.name);
        picks.push(c);
      }
    }

    return {
      dayIndex,
      dayName,
      focus: focusLabel(categories),
      isRestDay: false,
      completed: false,
      exercises: picks.map<DailyExercise>(t => ({
        id: `starter-${dayIndex}-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: t.name,
        category: t.category,
        targetMuscles: t.targetMuscles,
        sets: buildSets(t, loadFactor, repBias),
        completed: false,
        ...(strengthGoal ? { notes: 'Rest 3 minutes between sets' } : {}),
      })),
    };
  });

  const now = new Date();
  return {
    id: `starter-${Date.now()}`,
    userId: profile.id,
    days,
    generatedAt: now.toISOString(),
    weekLabel: `Week of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
  };
}
