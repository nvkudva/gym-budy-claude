# Code review — gym-budy-claude

A client-only React 18 + Vite + TypeScript gym tracker that asks Google Gemini for a 7-day workout plan, logs sets/reps, and keeps every byte of state in `localStorage`.

Read in full: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `index.html`, `.claude/settings.local.json`, all of `src/services/`, `src/context/AppContext.tsx`, `src/types/index.ts`, `src/App.tsx`, `src/main.tsx`, and the tracker, chat, onboarding, progress, plan-view and layout components. Skimmed only: `src/index.css` (215 lines), `src/components/plan/DayCard.tsx` (read to line 60), `src/data/exercises.ts` (read to line 25), `scripts/screenshot.mjs` (read to line 40). Lock file and screenshots not read.

## Architecture

Three layers, no router, no server.

1. **Service layer** — `src/services/gemini.ts` holds a lazily-built `GoogleGenerativeAI` singleton keyed off `import.meta.env.VITE_GEMINI_API_KEY`. `planGenerator.ts` builds the plan prompt, calls `callGemini`, and converts the model's JSON into `WeeklyPlan`. `chatService.ts` builds the coach system prompt and inspects the reply for a `PLAN_UPDATE_REQUESTED:` sentinel, which triggers a second full plan generation.
2. **State layer** — one context, `AppProvider` in `src/context/AppContext.tsx`. Five `useState` slices (profile, plan, messages, progress, records) each initialised from `load()` and written back through `save()` on every mutation. `localStorage` is the only persistence; `STORAGE_KEYS` at line 4 is the whole schema.
3. **View layer** — `App.tsx` renders `OnboardingFlow` when there is no profile, otherwise `AppLayout` plus one of four tab components. Every component reaches straight into `useApp()`; no props are threaded for shared state.

What the structure gets right: the AI boundary is genuinely thin. `callGemini` is the only place the SDK is touched, so swapping providers is one file. `extractJsonObject` (`planGenerator.ts:13`) is a real brace-balancing parser rather than a regex, and it is the one thing under unit test. Types in `src/types/index.ts` are precise unions, not `string`.

Where it will hurt:

- `planGenerator.ts:100-157` does prompt construction, network I/O, JSON extraction, an unchecked `as` cast of the parsed payload, and domain-object construction in one function. There is no validation step between `JSON.parse` and `parsed.days.map`, so a malformed model response becomes a `TypeError` at line 129 rather than a handled error.
- `chatService.ts:66-79` couples chat to plan generation through a string sentinel embedded in prose. Any model that reformats the token — or a user who asks it to — silently changes behaviour, and the branch only strips the token when `plan` is non-null (line 67), so with no plan the raw `PLAN_UPDATE_REQUESTED: …` text is rendered to the user.
- `AppContext.tsx` is a single value object rebuilt on every render (line 129), so every state change re-renders all four tabs. At this size it is fine; the moment a chart or a long history list lands it will not be.
- Storage is write-through with no schema version. Change any interface in `src/types/index.ts` and every existing user's saved plan deserialises into the new type with no migration and no failure signal.
- `WorkoutTracker.tsx:27-70` and `72-85` are near-duplicate immutable-update pyramids over `plan.days → exercises → sets`. A third mutation will be a third copy.

## Code quality

**Secrets.** `.claude/settings.local.json:8` contains a live-format Google API key inside a permission rule string: `Bash(VITE_GEMINI_API_KEY=AIzaSy…npm test)`. It is committed. Separately, the whole design ships the key to the browser — `import.meta.env.VITE_GEMINI_API_KEY` (`gemini.ts:9`) is inlined into the production bundle by Vite, so any deployed build hands the key to every visitor. `README.md:196` ("Nothing is sent to any server except the AI prompts") does not mention this.

**Error handling.** Uneven. `OnboardingFlow.tsx:64-68` catches and surfaces the message. `ChatBot.tsx:59-69` catches and shows a generic bubble. But `WeeklyPlanView.tsx:21-30` has `try`/`finally` with no `catch` — a failed regenerate produces an unhandled rejection and the user sees the spinner stop with no change and no message. `AppContext.tsx:24` swallows every storage write failure with an empty catch, so a `QuotaExceededError` loses the workout silently. `AppContext.tsx:12-18` returns `null` on corrupt JSON, which silently drops the user back into onboarding with all history gone.

**Lost writes.** `WorkoutTracker.completeSet` reads `plan!` from the render closure (line 28) and calls `setPlan({...plan!, days})` (line 44) instead of a functional update. Two set-completions within one render batch — an easy double-tap on a phone — make the second overwrite the first.

**Resource leak.** `startRestTimer` (`WorkoutTracker.tsx:87-100`) stores its interval in state but there is no `useEffect` cleanup. Switching tabs unmounts the tracker while the interval keeps firing `setRestTimer` on a dead component.

**Unvalidated model output.** `parseWeightedSets` (`planGenerator.ts:91`) does `Array.from({ length: sets })` on whatever the model returned. `sets: undefined` yields an empty array, and `updatedSets.every(...)` on an empty array is `true`, so the exercise reports itself complete. A large `sets` value renders that many input rows.

**Dead code and unused deps.** `src/services/anthropic.ts` is imported by nothing; `@anthropic-ai/sdk` is a production dependency for it and it sets `dangerouslyAllowBrowser: true` (line 13). `src/components/layout/GlassCard.tsx` is defined and never rendered. `getExercisesByCategory` / the lookup helper at `src/data/exercises.ts:89,93` have no callers.

**Broken tooling.** `package.json` declares `"lint": "eslint ."` but eslint is in neither dependency list and there is no eslint config — `npm run lint` cannot succeed. `vite.config.ts:8` calls `require('fs')` inside an ESM config in a `"type": "module"` package; `require` is undefined, the surrounding `catch` swallows the `ReferenceError`, and `test.env` is therefore always `{}`. The integration suite in `gemini.integration.test.ts:14` consequently self-skips unless the variable is exported in the shell, while `README.md:170` advertises 3 running integration tests.

**Test coverage.** Nine assertions, all against `extractJsonObject`, and they are good tests. Nothing covers `AppContext` persistence, `chatService` sentinel handling, `generateWeeklyPlan`'s parse-to-domain mapping, or any component — and `vite.config.ts` sets `environment: 'node'`, so component tests cannot be added without changing it first.

**Types.** Strict mode is on and the domain types are clean. The weak points are the inline structural cast at `planGenerator.ts:108` and the non-null assertions `plan!` / `profile!` scattered through `WorkoutTracker.tsx` and `ChatBot.tsx:44`.

**Licence.** `README.md:202` says MIT. There is no LICENSE file, so the repo is legally all-rights-reserved.

## Risks

- **Key disclosure.** The committed key in `.claude/settings.local.json` should be treated as compromised and rotated now. Independently, any hosted build of this app leaks whatever key it was built with; a browser-side Gemini key cannot be protected and needs a server-side proxy.
- **Unbounded cost.** Nothing rate-limits generation. One chat message can trigger a chat completion plus a full plan generation (`chatService.ts:72`), and `WeeklyPlanView`'s Regenerate button is tap-repeatable while a request is in flight only because of local `regenerating` state — the underlying key has no ceiling.
- **Data loss.** Three paths: silent `QuotaExceededError` (`AppContext.tsx:24`), corrupt-JSON reset to null (`AppContext.tsx:12`), and the lost-write race in `completeSet`. `progressHistory` grows one entry per completed set forever with no pruning, so quota exhaustion is a matter of time.
- **No offline story.** No web app manifest and no service worker, so the app is unusable in a gym without signal even though all its own data is local.
- **Prompt-shaped control flow.** The `PLAN_UPDATE_REQUESTED` sentinel means model output decides whether the user's saved plan is overwritten. The blast radius is limited to the user's own plan, but the plan is replaced wholesale with no confirmation and no undo.

## Action items

| Priority | Item | File | Why |
|---|---|---|---|
| P0 | Rotate the leaked Gemini key and delete it from the permission rule | `.claude/settings.local.json:8` | A live-format Google API key is committed in plaintext |
| P0 | Move Gemini calls behind a server proxy, or document that the key is public | `src/services/gemini.ts:9` | `VITE_`-prefixed vars are inlined into the client bundle |
| P0 | Add a LICENSE file or drop the MIT claim | `README.md:202` | Repo is all-rights-reserved despite advertising MIT |
| P1 | Validate the parsed model payload before mapping it to a `WeeklyPlan` | `src/services/planGenerator.ts:108` | An unchecked cast turns a bad response into a `TypeError` at line 129 |
| P1 | Catch and surface regenerate failures | `src/components/plan/WeeklyPlanView.tsx:21` | `try`/`finally` with no `catch` fails silently for the user |
| P1 | Use a functional `setPlan(prev => …)` in set mutations | `src/components/tracker/WorkoutTracker.tsx:44` | Stale-closure writes drop concurrent set completions |
| P1 | Clear the rest-timer interval on unmount | `src/components/tracker/WorkoutTracker.tsx:87` | Interval keeps firing state updates after a tab switch |
| P1 | Report storage write failures instead of swallowing them | `src/context/AppContext.tsx:24` | `QuotaExceededError` silently discards logged workouts |
| P1 | Strip the `PLAN_UPDATE_REQUESTED` token unconditionally | `src/services/chatService.ts:67` | With no plan, the internal sentinel is rendered to the user |
| P1 | Fix or remove the `lint` script | `package.json` | `eslint .` is declared with no eslint dependency and no config |
| P1 | Replace `require('fs')` in the ESM Vite config | `vite.config.ts:8` | `ReferenceError` is swallowed, so `test.env` is always empty |
| P2 | Guard `sets`/`reps` before building set arrays | `src/services/planGenerator.ts:91` | `Array.from({length: undefined})` marks an exercise instantly complete |
| P2 | Delete the unused Anthropic client and its dependency | `src/services/anthropic.ts` | Dead code carrying `dangerouslyAllowBrowser: true` and a prod dependency |
| P2 | Delete or use `GlassCard` | `src/components/layout/GlassCard.tsx` | Defined, never rendered |
| P2 | Add a schema version key and a migration path | `src/context/AppContext.tsx:4` | Any type change silently corrupts existing users' saved state |
| P2 | Prune or cap `progressHistory` | `src/context/AppContext.tsx:104` | One entry per set, never pruned, against a ~5MB quota |
| P2 | Extract the day/exercise/set update walk into one helper | `src/components/tracker/WorkoutTracker.tsx:27,72` | Two near-identical nested-map pyramids already |
| P2 | Switch the test environment to jsdom and add context/service tests | `vite.config.ts:6` | `environment: 'node'` blocks any component test |
| P2 | Correct the integration-test claim in the README | `README.md:170` | The three integration tests self-skip under the documented setup |
| P2 | Add a manifest and service worker, or stop calling this offline-capable | `index.html` | No offline support in an app used where signal is poor |
