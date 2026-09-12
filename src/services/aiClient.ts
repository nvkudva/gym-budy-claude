import { loadAIConfig, isAIConfigured } from './aiConfig';

export class AINotConfiguredError extends Error {
  constructor() {
    super('No AI provider configured. Open Settings → AI Provider and add an OpenRouter key.');
    this.name = 'AINotConfiguredError';
  }
}

export async function callAI(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): Promise<string> {
  const config = loadAIConfig();
  if (!isAIConfigured(config)) throw new AINotConfiguredError();

  const isLocal = config.provider === 'local';
  const endpoint = isLocal
    ? `${config.localBaseUrl.replace(/\/$/, '')}/chat/completions`
    : 'https://openrouter.ai/api/v1/chat/completions';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!isLocal) headers.Authorization = `Bearer ${config.openrouterApiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: isLocal ? config.localModel : config.openrouterModel,
      max_tokens: 8000,
      // Reasoning models otherwise spend the whole token budget thinking and
      // return empty content, which breaks the plan JSON parser.
      ...(isLocal ? {} : { reasoning: { exclude: true } }),
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`${isLocal ? 'Local model' : 'OpenRouter'} ${response.status}: ${await response.text()}`);
  }

  // OpenRouter emits ": OPENROUTER PROCESSING" keep-alive comment lines
  // ahead of the body on slow responses, which breaks response.json().
  const body = (await response.text()).replace(/^:[^\n]*\n/gm, '').trim();
  const data = JSON.parse(body);
  return data.choices?.[0]?.message?.content ?? '';
}
