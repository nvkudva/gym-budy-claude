# TODO

- [ ] Google sign-in — replace the local-only profile model with Google auth so plans and history sync across devices. Ported from the GymBuddy repo, which shows "Continue with Google" plus a guest path on onboarding step 1. Needs an auth provider (Firebase Auth or Cloudflare Access), a signed-in user id to key storage on instead of the local profile id, and a migration for profiles already in localStorage.
- [ ] Rotate the OpenRouter key in ~/.zshrc.secrets — an earlier build of this app published it in the deployed bundle.
- [ ] Replace the deleted Gemini integration test with one covering the OpenRouter path in src/services/aiClient.ts.
- [ ] Drop the unused @google/generative-ai and @anthropic-ai/sdk dependencies from package.json.

## Done

- [x] Switch the AI provider from Gemini to OpenRouter with a free model
- [x] Light/dark theme toggle
- [x] Profile & Settings screen (name, stats, goal, danger zone)
- [x] In-app AI provider config (OpenRouter key/model, or local Ollama)
- [x] Multiple profiles, each with its own plan, history and records
- [x] PWA: installable, offline app shell
- [x] Demo user for one-click demos with no API key
- [x] Deploy to Cloudflare
