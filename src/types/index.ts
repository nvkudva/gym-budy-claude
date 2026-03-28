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
    gradient: 'from-blue-600 to-violet-600',
    description: 'Build lean muscle mass with progressive overload',
  },
  'weight-loss': {
    label: 'Weight Loss',
    emoji: '🔥',
    gradient: 'from-orange-500 to-red-600',
    description: 'Burn fat and improve body composition',
  },
  'endurance': {
    label: 'Endurance',
    emoji: '⚡',
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Build stamina and cardiovascular fitness',
  },
  'general-fitness': {
    label: 'General Fitness',
    emoji: '🏃',
    gradient: 'from-pink-500 to-purple-600',
    description: 'Balanced fitness for overall health',
  },
  'strength': {
    label: 'Strength',
    emoji: '🏋️',
    gradient: 'from-cyan-500 to-blue-600',
    description: 'Maximize raw strength and power',
  },
  'running': {
    label: 'Running',
    emoji: '🏅',
    gradient: 'from-green-500 to-teal-600',
    description: 'Improve pace, distance and running form',
  },
};

export const DAY_GRADIENTS = [
  'from-violet-600/30 to-purple-800/30',
  'from-blue-600/30 to-cyan-800/30',
  'from-green-600/30 to-teal-800/30',
  'from-orange-600/30 to-amber-800/30',
  'from-pink-600/30 to-rose-800/30',
  'from-indigo-600/30 to-blue-800/30',
  'from-teal-600/30 to-green-800/30',
];

export const DAY_ACCENT_COLORS = [
  'text-violet-400',
  'text-blue-400',
  'text-green-400',
  'text-orange-400',
  'text-pink-400',
  'text-indigo-400',
  'text-teal-400',
];
