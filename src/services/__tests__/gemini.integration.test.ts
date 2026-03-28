/**
 * Integration test — hits the real Gemini API.
 * Requires VITE_GEMINI_API_KEY to be set in .env.local or environment.
 * Run with: npm test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.VITE_GEMINI_API_KEY ?? '';
const MODEL = 'gemini-2.5-flash';

// Skip all tests if no key is present
const runIf = API_KEY ? describe : describe.skip;

runIf('Gemini API integration', () => {
  let client: GoogleGenerativeAI;

  beforeAll(() => {
    client = new GoogleGenerativeAI(API_KEY);
  });

  it('responds to a simple prompt', async () => {
    const model = client.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent('Say exactly: GEMINI_OK');
    const text = result.response.text();
    expect(text).toContain('GEMINI_OK');
  }, 15_000);

  it('returns valid JSON for a plan request', async () => {
    const model = client.getGenerativeModel({
      model: MODEL,
      systemInstruction: 'You are a fitness coach. Return ONLY valid JSON, no markdown.',
    });

    const prompt = `Generate a minimal 2-day workout plan. Return exactly:
{"days":[{"dayIndex":0,"dayName":"Monday","focus":"Chest","isRestDay":false,"exercises":[{"name":"Push-Up","category":"chest","targetMuscles":["chest"],"sets":3,"reps":15,"weight":0}]},{"dayIndex":1,"dayName":"Tuesday","focus":"Rest","isRestDay":true,"exercises":[]}]}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];

    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty('days');
    expect(Array.isArray(parsed.days)).toBe(true);
    expect(parsed.days.length).toBeGreaterThanOrEqual(1);
  }, 20_000);

  it('handles multi-turn chat', async () => {
    const model = client.getGenerativeModel({
      model: MODEL,
      systemInstruction: 'You are a fitness coach. Keep answers under 30 words.',
    });
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'How many rest days per week?' }] },
        { role: 'model', parts: [{ text: '1–2 rest days per week is ideal for most people.' }] },
      ],
    });
    const result = await chat.sendMessage('What about for beginners?');
    const text = result.response.text();
    expect(text.length).toBeGreaterThan(5);
  }, 15_000);
});
