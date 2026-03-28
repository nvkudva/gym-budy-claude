import { describe, it, expect } from 'vitest';
import { extractJsonObject } from '../planGenerator';

// ─── Test data ─────────────────────────────────────────────────────────────────

const BARE_JSON = `{
  "days": [
    { "dayIndex": 0, "dayName": "Monday", "focus": "Chest", "isRestDay": false,
      "exercises": [{ "name": "Bench Press", "category": "chest", "targetMuscles": ["chest"], "sets": 3, "reps": 10, "weight": 60 }] }
  ]
}`;

const MARKDOWN_WRAPPED = `\`\`\`json\n${BARE_JSON}\n\`\`\``;
const MARKDOWN_NO_LANG = `\`\`\`\n${BARE_JSON}\n\`\`\``;
const WITH_PREAMBLE = `Sure! Here is your workout plan:\n\n${BARE_JSON}\n\nLet me know if you'd like changes.`;
const WITH_TRAILING_BRACE = `${BARE_JSON}\n\nNote: adjust weights as needed. Rest between sets (e.g. 90s).`;

// Simulates Gemini adding extra text after the JSON that contains a stray `}`
const WITH_CONFUSING_SUFFIX = `${BARE_JSON}\n\nTip: use tempo (e.g. 2-0-2} style) for better control.`;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('extractJsonObject — JSON extraction from Gemini response', () => {
  it('parses bare JSON directly', () => {
    const result = JSON.parse(extractJsonObject(BARE_JSON));
    expect(result.days).toHaveLength(1);
    expect(result.days[0].dayName).toBe('Monday');
  });

  it('strips ```json code fences', () => {
    const result = JSON.parse(extractJsonObject(MARKDOWN_WRAPPED));
    expect(result.days[0].focus).toBe('Chest');
  });

  it('strips ``` code fences (no language tag)', () => {
    const result = JSON.parse(extractJsonObject(MARKDOWN_NO_LANG));
    expect(result.days[0].exercises[0].name).toBe('Bench Press');
  });

  it('extracts JSON when there is preamble text before it', () => {
    const result = JSON.parse(extractJsonObject(WITH_PREAMBLE));
    expect(result.days[0].exercises[0].weight).toBe(60);
  });

  it('stops at the correct closing brace — ignores trailing text', () => {
    const result = JSON.parse(extractJsonObject(WITH_TRAILING_BRACE));
    expect(result.days[0].dayIndex).toBe(0);
  });

  it('handles stray } characters in trailing text without breaking', () => {
    const result = JSON.parse(extractJsonObject(WITH_CONFUSING_SUFFIX));
    expect(result.days).toBeDefined();
  });

  it('throws when no JSON object exists in the string', () => {
    expect(() => extractJsonObject('No JSON here at all')).toThrow('No JSON object found');
  });
});

describe('Parsed plan shape', () => {
  it('has required day fields', () => {
    const plan = JSON.parse(extractJsonObject(BARE_JSON));
    const day = plan.days[0];
    expect(day).toHaveProperty('dayIndex');
    expect(day).toHaveProperty('dayName');
    expect(day).toHaveProperty('focus');
    expect(day).toHaveProperty('isRestDay');
    expect(Array.isArray(day.exercises)).toBe(true);
  });

  it('exercise has sets, reps, weight, category', () => {
    const plan = JSON.parse(extractJsonObject(BARE_JSON));
    const ex = plan.days[0].exercises[0];
    expect(typeof ex.sets).toBe('number');
    expect(typeof ex.reps).toBe('number');
    expect(typeof ex.weight).toBe('number');
    expect(typeof ex.category).toBe('string');
  });
});
