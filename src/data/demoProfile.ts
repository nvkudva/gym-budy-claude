import type {
  UserProfile, WeeklyPlan, WorkoutDay, DailyExercise, WorkoutSet,
  ProgressEntry, PersonalRecord, ExerciseCategory,
} from '../types';

export const DEMO_PROFILE_ID = 'demo-user';

export const DEMO_PROFILE: UserProfile = {
  id: DEMO_PROFILE_ID,
  name: 'Demo User',
  age: 30,
  height: 175,
  weight: 76,
  goal: 'muscle-gain',
  experience: 'intermediate',
  equipment: ['barbell', 'dumbbells', 'machines'],
  workoutsPerWeek: 4,
  createdAt: new Date().toISOString(),
};

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function sets(count: number, reps: number, weight: number, completed: number): WorkoutSet[] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    plannedReps: reps,
    weight,
    completed: i < completed,
    ...(i < completed ? { actualReps: reps, completedAt: new Date().toISOString() } : {}),
  }));
}

function exercise(
  name: string,
  category: ExerciseCategory,
  targetMuscles: string[],
  setCount: number,
  reps: number,
  weight: number,
  completedSets = 0,
  notes?: string,
): DailyExercise {
  return {
    id: `demo-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    category,
    targetMuscles,
    sets: sets(setCount, reps, weight, completedSets),
    completed: completedSets === setCount,
    ...(notes ? { notes } : {}),
  };
}

function restDay(dayIndex: number): WorkoutDay {
  return {
    dayIndex,
    dayName: DAY_NAMES[dayIndex],
    focus: 'Rest Day',
    exercises: [],
    isRestDay: true,
    completed: false,
  };
}

function weekLabel(): string {
  const now = new Date();
  return `Week of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function buildDemoPlan(): WeeklyPlan {
  const days: WorkoutDay[] = [
    {
      dayIndex: 0,
      dayName: 'Monday',
      focus: 'Chest & Triceps',
      isRestDay: false,
      completed: true,
      exercises: [
        exercise('Barbell Bench Press', 'chest', ['chest', 'triceps'], 4, 8, 70, 4, 'Retract the shoulder blades and keep the bar path over the sternum'),
        exercise('Incline Dumbbell Press', 'chest', ['chest', 'shoulders'], 3, 10, 24, 3),
        exercise('Cable Fly', 'chest', ['chest'], 3, 12, 18, 3),
        exercise('Triceps Rope Pushdown', 'triceps', ['triceps'], 3, 12, 25, 3),
      ],
    },
    {
      dayIndex: 1,
      dayName: 'Tuesday',
      focus: 'Back & Biceps',
      isRestDay: false,
      completed: true,
      exercises: [
        exercise('Deadlift', 'back', ['back', 'glutes', 'hamstrings'], 4, 5, 110, 4, 'Brace hard, push the floor away'),
        exercise('Pull-Up', 'back', ['lats', 'biceps'], 4, 8, 0, 4),
        exercise('Barbell Row', 'back', ['back', 'rear delts'], 3, 10, 60, 3),
        exercise('Dumbbell Curl', 'biceps', ['biceps'], 3, 12, 14, 2),
      ],
    },
    restDay(2),
    {
      dayIndex: 3,
      dayName: 'Thursday',
      focus: 'Legs & Core',
      isRestDay: false,
      completed: false,
      exercises: [
        exercise('Back Squat', 'legs', ['quads', 'glutes'], 4, 6, 95, 2, 'Depth before load'),
        exercise('Romanian Deadlift', 'legs', ['hamstrings', 'glutes'], 3, 10, 70, 0),
        exercise('Leg Press', 'legs', ['quads'], 3, 12, 140, 0),
        exercise('Hanging Leg Raise', 'core', ['abs'], 3, 12, 0, 0),
      ],
    },
    restDay(4),
    {
      dayIndex: 5,
      dayName: 'Saturday',
      focus: 'Shoulders & Arms',
      isRestDay: false,
      completed: false,
      exercises: [
        exercise('Overhead Press', 'shoulders', ['shoulders', 'triceps'], 4, 8, 45, 0),
        exercise('Lateral Raise', 'shoulders', ['side delts'], 3, 15, 10, 0),
        exercise('Face Pull', 'shoulders', ['rear delts'], 3, 15, 20, 0),
        exercise('Close-Grip Bench Press', 'triceps', ['triceps', 'chest'], 3, 10, 55, 0),
      ],
    },
    restDay(6),
  ];

  return {
    id: 'demo-plan',
    userId: DEMO_PROFILE_ID,
    days,
    generatedAt: new Date().toISOString(),
    weekLabel: weekLabel(),
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const DEMO_PROGRESS: ProgressEntry[] = [
  { id: 'dp1', date: daysAgo(14), exerciseName: 'Barbell Bench Press', totalVolume: 2040, maxWeight: 62.5, totalReps: 34, sets: 4 },
  { id: 'dp2', date: daysAgo(11), exerciseName: 'Back Squat', totalVolume: 2160, maxWeight: 85, totalReps: 26, sets: 4 },
  { id: 'dp3', date: daysAgo(7), exerciseName: 'Barbell Bench Press', totalVolume: 2176, maxWeight: 67.5, totalReps: 33, sets: 4 },
  { id: 'dp4', date: daysAgo(6), exerciseName: 'Deadlift', totalVolume: 2100, maxWeight: 105, totalReps: 20, sets: 4 },
  { id: 'dp5', date: daysAgo(4), exerciseName: 'Back Squat', totalVolume: 2280, maxWeight: 92.5, totalReps: 25, sets: 4 },
  { id: 'dp6', date: daysAgo(1), exerciseName: 'Barbell Bench Press', totalVolume: 2240, maxWeight: 70, totalReps: 32, sets: 4 },
  { id: 'dp7', date: daysAgo(1), exerciseName: 'Deadlift', totalVolume: 2200, maxWeight: 110, totalReps: 20, sets: 4 },
];

export const DEMO_RECORDS: Record<string, PersonalRecord> = {
  'Barbell Bench Press': { exerciseName: 'Barbell Bench Press', weight: 70, reps: 8, date: daysAgo(1) },
  'Deadlift': { exerciseName: 'Deadlift', weight: 110, reps: 5, date: daysAgo(1) },
  'Back Squat': { exerciseName: 'Back Squat', weight: 92.5, reps: 6, date: daysAgo(4) },
  'Overhead Press': { exerciseName: 'Overhead Press', weight: 45, reps: 8, date: daysAgo(9) },
};
