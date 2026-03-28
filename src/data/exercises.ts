import type { ExerciseCategory } from '../types';

export interface ExerciseTemplate {
  name: string;
  category: ExerciseCategory;
  targetMuscles: string[];
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number; // kg, 0 = bodyweight
}

export const EXERCISES: ExerciseTemplate[] = [
  // Chest
  { name: 'Barbell Bench Press', category: 'chest', targetMuscles: ['chest', 'triceps', 'front deltoid'], defaultSets: 4, defaultReps: 8, defaultWeight: 60 },
  { name: 'Incline Dumbbell Press', category: 'chest', targetMuscles: ['upper chest', 'front deltoid'], defaultSets: 3, defaultReps: 10, defaultWeight: 24 },
  { name: 'Cable Fly', category: 'chest', targetMuscles: ['chest', 'front deltoid'], defaultSets: 3, defaultReps: 12, defaultWeight: 15 },
  { name: 'Push-Up', category: 'chest', targetMuscles: ['chest', 'triceps', 'core'], defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { name: 'Decline Bench Press', category: 'chest', targetMuscles: ['lower chest', 'triceps'], defaultSets: 3, defaultReps: 10, defaultWeight: 55 },
  { name: 'Dumbbell Chest Fly', category: 'chest', targetMuscles: ['chest'], defaultSets: 3, defaultReps: 12, defaultWeight: 18 },

  // Back
  { name: 'Barbell Deadlift', category: 'back', targetMuscles: ['lower back', 'hamstrings', 'glutes', 'traps'], defaultSets: 4, defaultReps: 5, defaultWeight: 80 },
  { name: 'Pull-Up', category: 'back', targetMuscles: ['lats', 'biceps', 'rear deltoid'], defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
  { name: 'Barbell Row', category: 'back', targetMuscles: ['lats', 'rhomboids', 'biceps'], defaultSets: 4, defaultReps: 8, defaultWeight: 60 },
  { name: 'Lat Pulldown', category: 'back', targetMuscles: ['lats', 'biceps'], defaultSets: 3, defaultReps: 12, defaultWeight: 55 },
  { name: 'Seated Cable Row', category: 'back', targetMuscles: ['rhomboids', 'lats', 'biceps'], defaultSets: 3, defaultReps: 12, defaultWeight: 55 },
  { name: 'Face Pull', category: 'back', targetMuscles: ['rear deltoid', 'rotator cuff'], defaultSets: 3, defaultReps: 15, defaultWeight: 20 },
  { name: 'Dumbbell Row', category: 'back', targetMuscles: ['lats', 'rhomboids'], defaultSets: 3, defaultReps: 12, defaultWeight: 30 },

  // Shoulders
  { name: 'Overhead Press', category: 'shoulders', targetMuscles: ['front deltoid', 'triceps', 'upper traps'], defaultSets: 4, defaultReps: 8, defaultWeight: 40 },
  { name: 'Lateral Raise', category: 'shoulders', targetMuscles: ['side deltoid'], defaultSets: 3, defaultReps: 15, defaultWeight: 10 },
  { name: 'Front Raise', category: 'shoulders', targetMuscles: ['front deltoid'], defaultSets: 3, defaultReps: 12, defaultWeight: 10 },
  { name: 'Arnold Press', category: 'shoulders', targetMuscles: ['all deltoid heads'], defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
  { name: 'Upright Row', category: 'shoulders', targetMuscles: ['side deltoid', 'traps'], defaultSets: 3, defaultReps: 12, defaultWeight: 30 },

  // Biceps
  { name: 'Barbell Curl', category: 'biceps', targetMuscles: ['biceps', 'brachialis'], defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
  { name: 'Dumbbell Curl', category: 'biceps', targetMuscles: ['biceps'], defaultSets: 3, defaultReps: 12, defaultWeight: 14 },
  { name: 'Hammer Curl', category: 'biceps', targetMuscles: ['brachialis', 'brachioradialis'], defaultSets: 3, defaultReps: 12, defaultWeight: 14 },
  { name: 'Preacher Curl', category: 'biceps', targetMuscles: ['biceps'], defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
  { name: 'Cable Curl', category: 'biceps', targetMuscles: ['biceps'], defaultSets: 3, defaultReps: 15, defaultWeight: 20 },

  // Triceps
  { name: 'Tricep Dip', category: 'triceps', targetMuscles: ['triceps', 'chest'], defaultSets: 3, defaultReps: 12, defaultWeight: 0 },
  { name: 'Skull Crusher', category: 'triceps', targetMuscles: ['triceps'], defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
  { name: 'Tricep Pushdown', category: 'triceps', targetMuscles: ['triceps'], defaultSets: 3, defaultReps: 15, defaultWeight: 25 },
  { name: 'Overhead Tricep Extension', category: 'triceps', targetMuscles: ['triceps long head'], defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { name: 'Close-Grip Bench Press', category: 'triceps', targetMuscles: ['triceps', 'chest'], defaultSets: 3, defaultReps: 10, defaultWeight: 50 },

  // Legs
  { name: 'Barbell Squat', category: 'legs', targetMuscles: ['quads', 'glutes', 'hamstrings'], defaultSets: 4, defaultReps: 8, defaultWeight: 70 },
  { name: 'Romanian Deadlift', category: 'legs', targetMuscles: ['hamstrings', 'glutes'], defaultSets: 3, defaultReps: 10, defaultWeight: 60 },
  { name: 'Leg Press', category: 'legs', targetMuscles: ['quads', 'glutes'], defaultSets: 4, defaultReps: 12, defaultWeight: 100 },
  { name: 'Lunges', category: 'legs', targetMuscles: ['quads', 'glutes', 'hamstrings'], defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
  { name: 'Leg Extension', category: 'legs', targetMuscles: ['quads'], defaultSets: 3, defaultReps: 15, defaultWeight: 40 },
  { name: 'Leg Curl', category: 'legs', targetMuscles: ['hamstrings'], defaultSets: 3, defaultReps: 12, defaultWeight: 35 },
  { name: 'Calf Raise', category: 'legs', targetMuscles: ['calves'], defaultSets: 4, defaultReps: 20, defaultWeight: 50 },
  { name: 'Bulgarian Split Squat', category: 'legs', targetMuscles: ['quads', 'glutes'], defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
  { name: 'Goblet Squat', category: 'legs', targetMuscles: ['quads', 'glutes'], defaultSets: 3, defaultReps: 15, defaultWeight: 24 },

  // Glutes
  { name: 'Hip Thrust', category: 'glutes', targetMuscles: ['glutes', 'hamstrings'], defaultSets: 4, defaultReps: 12, defaultWeight: 60 },
  { name: 'Glute Bridge', category: 'glutes', targetMuscles: ['glutes'], defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
  { name: 'Sumo Deadlift', category: 'glutes', targetMuscles: ['glutes', 'inner thighs', 'hamstrings'], defaultSets: 3, defaultReps: 10, defaultWeight: 70 },
  { name: 'Cable Kickback', category: 'glutes', targetMuscles: ['glutes'], defaultSets: 3, defaultReps: 15, defaultWeight: 10 },

  // Core
  { name: 'Plank', category: 'core', targetMuscles: ['core', 'stabilizers'], defaultSets: 3, defaultReps: 60, defaultWeight: 0 },
  { name: 'Crunches', category: 'core', targetMuscles: ['abs'], defaultSets: 3, defaultReps: 20, defaultWeight: 0 },
  { name: 'Russian Twist', category: 'core', targetMuscles: ['obliques', 'abs'], defaultSets: 3, defaultReps: 20, defaultWeight: 10 },
  { name: 'Hanging Leg Raise', category: 'core', targetMuscles: ['lower abs', 'hip flexors'], defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { name: 'Cable Crunch', category: 'core', targetMuscles: ['abs'], defaultSets: 3, defaultReps: 15, defaultWeight: 25 },
  { name: 'Ab Wheel Rollout', category: 'core', targetMuscles: ['abs', 'core'], defaultSets: 3, defaultReps: 10, defaultWeight: 0 },
  { name: 'Side Plank', category: 'core', targetMuscles: ['obliques', 'core'], defaultSets: 2, defaultReps: 30, defaultWeight: 0 },

  // Cardio
  { name: 'Treadmill Run', category: 'cardio', targetMuscles: ['legs', 'cardiovascular'], defaultSets: 1, defaultReps: 20, defaultWeight: 0 },
  { name: 'Rowing Machine', category: 'cardio', targetMuscles: ['full body', 'cardiovascular'], defaultSets: 1, defaultReps: 15, defaultWeight: 0 },
  { name: 'Jump Rope', category: 'cardio', targetMuscles: ['calves', 'cardiovascular'], defaultSets: 3, defaultReps: 60, defaultWeight: 0 },
  { name: 'Cycling', category: 'cardio', targetMuscles: ['legs', 'cardiovascular'], defaultSets: 1, defaultReps: 30, defaultWeight: 0 },
  { name: 'Burpees', category: 'cardio', targetMuscles: ['full body', 'cardiovascular'], defaultSets: 3, defaultReps: 15, defaultWeight: 0 },
  { name: 'Box Jump', category: 'cardio', targetMuscles: ['legs', 'power', 'cardiovascular'], defaultSets: 4, defaultReps: 10, defaultWeight: 0 },
  { name: 'Stair Climber', category: 'cardio', targetMuscles: ['legs', 'glutes', 'cardiovascular'], defaultSets: 1, defaultReps: 20, defaultWeight: 0 },
  { name: 'Battle Ropes', category: 'cardio', targetMuscles: ['shoulders', 'arms', 'cardiovascular'], defaultSets: 4, defaultReps: 30, defaultWeight: 0 },
];

export function getExercisesByCategory(category: ExerciseCategory): ExerciseTemplate[] {
  return EXERCISES.filter(e => e.category === category);
}

export function getExerciseByName(name: string): ExerciseTemplate | undefined {
  return EXERCISES.find(e => e.name.toLowerCase() === name.toLowerCase());
}
