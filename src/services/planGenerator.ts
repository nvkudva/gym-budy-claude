import { callGemini } from './gemini';
import type { UserProfile, WeeklyPlan, WorkoutDay, DailyExercise, WorkoutSet } from '../types';
import { EXERCISES } from '../data/exercises';

const PLAN_SYSTEM_PROMPT = `You are an expert certified personal trainer and sports nutritionist.
Generate personalized weekly workout plans in valid JSON format only.
Your response must be ONLY valid JSON - no markdown, no explanation, no comments, just the raw JSON object.`;

/**
 * Robustly extracts the first complete JSON object from a string by
 * balancing braces — handles markdown fences, preamble text, and trailing content.
 */
export function extractJsonObject(raw: string): string {
  // Strip markdown code fences
  let text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in response');

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }

  // Fallback: return from first { to end
  return text.slice(start);
}

function buildPlanPrompt(profile: UserProfile, customRequest?: string): string {
  const exerciseList = EXERCISES.map(e => e.name).join(', ');
  const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);

  return `Generate a ${profile.workoutsPerWeek}-day weekly workout plan for:
- Name: ${profile.name}
- Age: ${profile.age} years
- Height: ${profile.height} cm, Weight: ${profile.weight} kg (BMI: ${bmi})
- Goal: ${profile.goal}
- Experience: ${profile.experience}
- Equipment: ${profile.equipment.join(', ')}
- Workout days per week: ${profile.workoutsPerWeek}

${customRequest ? `Special request: ${customRequest}` : ''}

Available exercises: ${exerciseList}

Return this exact JSON structure (no extra text):
{
  "days": [
    {
      "dayIndex": 0,
      "dayName": "Monday",
      "focus": "Chest & Triceps",
      "isRestDay": false,
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "category": "chest",
          "targetMuscles": ["chest", "triceps"],
          "sets": 4,
          "reps": 8,
          "weight": 60,
          "notes": "Keep shoulder blades retracted"
        }
      ]
    }
  ]
}

Rules:
- Create exactly 7 days (dayIndex 0-6, Monday to Sunday)
- Rest days have isRestDay: true and empty exercises array
- Spread rest days appropriately for recovery
- Match exercise complexity to experience level (beginner = simpler compound movements)
- For goal "running" or "endurance": include more cardio exercises
- For "muscle-gain" or "strength": prioritize heavy compound lifts
- For "weight-loss": mix cardio and resistance training
- For bodyweight-only equipment: only use bodyweight exercises
- Weight in kg (0 for bodyweight)
- Reps for cardio exercises = minutes`;
}

function parseWeightedSets(sets: number, reps: number, weight: number): WorkoutSet[] {
  return Array.from({ length: sets }, (_, i) => ({
    setNumber: i + 1,
    plannedReps: reps,
    weight,
    completed: false,
  }));
}

export async function generateWeeklyPlan(
  profile: UserProfile,
  customRequest?: string
): Promise<WeeklyPlan> {
  const prompt = buildPlanPrompt(profile, customRequest);
  const raw = await callGemini(PLAN_SYSTEM_PROMPT, prompt);
  const jsonStr = extractJsonObject(raw);

  const parsed = JSON.parse(jsonStr) as {
    days: Array<{
      dayIndex: number;
      dayName: string;
      focus: string;
      isRestDay: boolean;
      exercises: Array<{
        name: string;
        category: string;
        targetMuscles: string[];
        sets: number;
        reps: number;
        weight: number;
        notes?: string;
      }>;
    }>;
  };

  const now = new Date();
  const weekLabel = `Week of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const days: WorkoutDay[] = parsed.days.map(d => ({
    dayIndex: d.dayIndex,
    dayName: d.dayName,
    focus: d.focus,
    isRestDay: d.isRestDay,
    completed: false,
    exercises: (d.exercises || []).map(e => {
      const exerciseId = `${e.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const sets = parseWeightedSets(e.sets, e.reps, e.weight);
      const daily: DailyExercise = {
        id: exerciseId,
        name: e.name,
        category: e.category as DailyExercise['category'],
        targetMuscles: e.targetMuscles,
        sets,
        notes: e.notes,
        completed: false,
      };
      return daily;
    }),
  }));

  return {
    id: `plan-${Date.now()}`,
    userId: profile.id,
    days,
    generatedAt: now.toISOString(),
    weekLabel,
  };
}
