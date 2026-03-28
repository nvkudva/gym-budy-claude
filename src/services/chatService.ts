import { callGemini } from './gemini';
import type { UserProfile, WeeklyPlan, ChatMessage } from '../types';
import { generateWeeklyPlan } from './planGenerator';

export interface ChatResponse {
  message: string;
  updatedPlan?: WeeklyPlan;
  isPlanUpdate: boolean;
}

function buildSystemPrompt(profile: UserProfile, plan: WeeklyPlan | null): string {
  const planSummary = plan
    ? plan.days
        .map(d => `${d.dayName}: ${d.isRestDay ? 'Rest' : d.focus + ' (' + d.exercises.map(e => e.name).join(', ') + ')'}`)
        .join('\n')
    : 'No plan yet';

  return `You are ${profile.name}'s personal AI fitness coach. You are knowledgeable, motivating, and give practical advice.

User Profile:
- Name: ${profile.name}, Age: ${profile.age}
- Height: ${profile.height}cm, Weight: ${profile.weight}kg
- Goal: ${profile.goal}
- Experience: ${profile.experience}
- Equipment: ${profile.equipment.join(', ')}

Current Weekly Plan:
${planSummary}

Your capabilities:
1. Answer questions about exercise form, nutrition, diet, recovery, and health
2. Modify the workout plan when requested (respond with PLAN_UPDATE_REQUESTED token)
3. Give personalized advice based on the user's profile

When the user asks to:
- Change, modify, replace, add, or remove exercises from their plan
- Generate a new plan or customize their schedule
- Adjust workout frequency or intensity

Include the exact text "PLAN_UPDATE_REQUESTED: <brief description of what to change>" at the end of your message.

Examples:
- "PLAN_UPDATE_REQUESTED: Replace bench press with push-ups on chest day"
- "PLAN_UPDATE_REQUESTED: Add more cardio, reduce rest days to 1"
- "PLAN_UPDATE_REQUESTED: Switch to a beginner-friendly full body program"

Keep responses concise, friendly, and actionable. Use bullet points for clarity. Max 3-4 paragraphs.`;
}

export async function sendChatMessage(
  userMessage: string,
  profile: UserProfile,
  plan: WeeklyPlan | null,
  history: ChatMessage[]
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(profile, plan);

  const geminiHistory = history.slice(-10).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const rawResponse = await callGemini(systemPrompt, userMessage, geminiHistory);

  // Check if plan update was requested
  const planUpdateMatch = rawResponse.match(/PLAN_UPDATE_REQUESTED:\s*(.+?)(?:\n|$)/i);
  if (planUpdateMatch && plan) {
    const updateDescription = planUpdateMatch[1].trim();
    const cleanMessage = rawResponse.replace(/PLAN_UPDATE_REQUESTED:.+/i, '').trim();

    // Generate updated plan with the specific request
    const updatedPlan = await generateWeeklyPlan(profile, updateDescription);

    return {
      message: cleanMessage + '\n\n✅ I\'ve updated your workout plan based on your request!',
      updatedPlan,
      isPlanUpdate: true,
    };
  }

  return {
    message: rawResponse,
    isPlanUpdate: false,
  };
}
