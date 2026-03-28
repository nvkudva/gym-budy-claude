// ─── User Profile ────────────────────────────────────────────────────────────

export type FitnessGoal =
  | 'muscle-gain'
  | 'weight-loss'
  | 'endurance'
  | 'general-fitness'
  | 'strength'
  | 'running';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type Equipment = 'barbell' | 'dumbbells' | 'bodyweight' | 'machines' | 'resistance-bands';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: FitnessGoal;
  experience: ExperienceLevel;
  equipment: Equipment[];
  workoutsPerWeek: number;
  createdAt: string;
}

// ─── Exercise ────────────────────────────────────────────────────────────────

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full-body';

export interface WorkoutSet {
  setNumber: number;
  plannedReps: number;
  weight: number; // kg, 0 = bodyweight
  completed: boolean;
  actualReps?: number;
  completedAt?: string;
}

export interface DailyExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  targetMuscles: string[];
  sets: WorkoutSet[];
  notes?: string;
  completed: boolean;
}

// ─── Workout Plan ─────────────────────────────────────────────────────────────

export interface WorkoutDay {
  dayIndex: number; // 0 = Monday
  dayName: string;
  focus: string; // e.g. "Chest & Triceps"
  exercises: DailyExercise[];
  isRestDay: boolean;
  completed: boolean;
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  days: WorkoutDay[];
  generatedAt: string;
  weekLabel: string; // e.g. "Week of Mar 25"
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressEntry {
  id: string;
  date: string; // ISO
  exerciseName: string;
  totalVolume: number; // sets × reps × weight
  maxWeight: number;
  totalReps: number;
  sets: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

export interface WeekStats {
  totalWorkouts: number;
  totalExercises: number;
  totalVolume: number;
  completionRate: number; // 0-100
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isPlanUpdate?: boolean;
}

// ─── Goal Meta ────────────────────────────────────────────────────────────────

export const GOAL_META: Record<FitnessGoal, { label: string; emoji: string; gradient: string; description: string }> = {
  'muscle-gain': {
    label: 'Muscle Gain',
    emoji: '💪',
    gradient: 'from-amber-600 to-orange-700',
    description: 'Build lean muscle mass with progressive overload',
  },
  'weight-loss': {
    label: 'Weight Loss',
    emoji: '🔥',
    gradient: 'from-orange-600 to-red-700',
    description: 'Burn fat and improve body composition',
  },
  'endurance': {
    label: 'Endurance',
    emoji: '⚡',
    gradient: 'from-amber-500 to-yellow-700',
    description: 'Build stamina and cardiovascular fitness',
  },
  'general-fitness': {
    label: 'General Fitness',
    emoji: '🏃',
    gradient: 'from-orange-500 to-amber-700',
    description: 'Balanced fitness for overall health',
  },
  'strength': {
    label: 'Strength',
    emoji: '🏋️',
    gradient: 'from-red-600 to-orange-700',
    description: 'Maximize raw strength and power',
  },
  'running': {
    label: 'Running',
    emoji: '🏅',
    gradient: 'from-amber-600 to-orange-600',
    description: 'Improve pace, distance and running form',
  },
};

// Warm muted gradients matching the dark Oura-style palette
export const DAY_GRADIENTS = [
  'from-amber-800/25 to-orange-900/25',
  'from-orange-800/25 to-red-900/25',
  'from-stone-700/25 to-stone-900/25',
  'from-amber-700/25 to-yellow-900/25',
  'from-red-800/25 to-orange-900/25',
  'from-orange-700/25 to-amber-900/25',
  'from-stone-600/25 to-stone-800/25',
];

export const DAY_ACCENT_COLORS = [
  'text-amber-400',
  'text-orange-400',
  'text-stone-300',
  'text-yellow-400',
  'text-red-400',
  'text-amber-300',
  'text-orange-300',
];
