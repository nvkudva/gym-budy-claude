import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!_client) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Missing VITE_ANTHROPIC_API_KEY. Create a .env.local file with your Anthropic API key.');
    }
    _client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return _client;
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  maxTokens = 2048
): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      ...history,
      { role: 'user', content: userMessage },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}
