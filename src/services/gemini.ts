import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL = 'gemini-2.5-flash';

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env.local file.');
    }
    _client = new GoogleGenerativeAI(apiKey);
  }
  return _client;
}

export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
  });

  // Convert history to Gemini format (role: 'user' | 'model')
  const geminiHistory = history.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
