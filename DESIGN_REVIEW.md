# Design Review

Gym Buddy's job is to be held in one sweaty hand between sets: show me what I lift today, let me record a set in one thumb-tap, and show me whether I am getting stronger. The current design does the first job well and actively obstructs the other two — the primary logging control is a 32px checkbox inside a 32px-tall input row, the only trend chart on the Progress tab renders zero-height bars and draws literally nothing, and the AI Coach advertises a green "Always available" dot while every message fails with an unrecoverable error bubble. Underneath that, the app has no type scale, no spacing scale, and one single amber hue doing the work of six semantic states, so nothing on screen has a hierarchy you can read at arm's length. Fix the logging row, the broken chart, and the coach's honesty, and this goes from a good-looking demo to something you would actually use on a gym floor.

## Severity legend

- **P0** — broken or embarrassing. Renders nothing, lies to the user, or makes the core task unreliable. Fix first.
- **P1** — materially hurts use. The task still completes, but slower, with more taps, or with avoidable confusion.
- **P2** — refinement. Craft, consistency, and polish.

---

## Cross-cutting

### [P0] Every primary control is below the 44pt minimum touch target
**Observed:** Workout tab, mobile 375×812, dark. The per-set "Done" checkbox is `w-8 h-8` (32×32px). The weight and reps `<input>`s are `py-1.5` + `text-sm` ≈ 30px tall. The header theme and settings buttons are `w-8 h-8`. The day-selector chips are `px-3 py-2` ≈ 32px tall. These are the four controls a user touches most, all with wet hands.
**Why it's wrong:** HIG requires a 44×44pt minimum hit region for any tappable control. 32px is a miss-prone target; in a gym, between sets, with a shaking forearm, it is a mis-tap generator.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`, change the set-row `Done` buttons (both the completed and uncompleted branches, currently `w-8 h-8 rounded-lg`) to `w-11 h-11 rounded-xl`, and the grid template from `grid-cols-[40px_1fr_1fr_48px]` to `grid-cols-[36px_1fr_1fr_56px]`. Change both set `<input>`s from `input-glass py-1.5 text-sm` to `input-glass py-2.5 text-base` (min-height 44px). In `src/index.css`, add to `@layer components` a `.tap-44 { min-width: 44px; min-height: 44px; }` and apply it to the header buttons in `src/components/layout/AppLayout.tsx` (both `w-8 h-8 rounded-full glass glass-hover`) and the day chips in `WorkoutTracker.tsx` (`px-3 py-2 rounded-xl text-xs`→ `px-4 py-3 rounded-xl text-sm`).

### [P0] There is no type scale — 11 distinct font sizes, most of them arbitrary
**Observed:** Across all screens. In use: `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-xs` (12), `text-sm` (14), `text-base` (16), `text-lg` (18), `text-xl` (20), `text-2xl` (24), `text-4xl` (36). `ProgressDashboard.tsx` uses `text-[8px]` for the M/T/W day initials under the weekly ring and `text-[9px]` for the "complete" label — both are unreadable at arm's length.
**Why it's wrong:** HIG's Dynamic Type ladder exists so hierarchy is legible without squinting; 8px and 9px are below any iOS system size (the smallest, Caption 2, is 11pt). An 11-step scale with no rules means every screen invents its own hierarchy.
**Action:** In `src/index.css` `@layer components`, define a 6-step scale as utility classes and use only these: `.t-display {font-size:28px;line-height:32px;font-weight:700;letter-spacing:-0.02em}`, `.t-title {font-size:20px;line-height:25px;font-weight:700;letter-spacing:-0.01em}`, `.t-headline {font-size:17px;line-height:22px;font-weight:600}`, `.t-body {font-size:15px;line-height:20px;font-weight:400}`, `.t-caption {font-size:13px;line-height:18px;font-weight:500}`, `.t-micro {font-size:11px;line-height:14px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase}`. Then delete every `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]` occurrence in `ProgressDashboard.tsx`, `DayCard.tsx`, `SettingsView.tsx`, `ChatBot.tsx`, `AppLayout.tsx` and replace with `.t-micro` or `.t-caption`.

### [P1] No spacing rhythm — each screen picks its own gutter
**Observed:** `WeeklyPlanView.tsx` root is `px-4`; `SettingsView.tsx` root is `px-5`; `WorkoutTracker.tsx` uses `px-4` for the list but `mx-4` for the day header card; `AppLayout.tsx` header is `px-5`. Switching Plan → Profile visibly shifts every card edge by 4px.
**Why it's wrong:** A fixed side gutter is the strongest cue that tabs belong to one app. A 4px jitter on tab change reads as a rendering bug.
**Action:** Standardise on a 20px gutter. Change `WeeklyPlanView.tsx` root `px-4` → `px-5`, `WorkoutTracker.tsx` `px-4 pt-2 pb-3` → `px-5 pt-2 pb-3`, `px-4 space-y-3 pb-6` → `px-5 space-y-3 pb-6`, and `mx-4` → `mx-5` on the day header and rest-timer blocks. `ProgressDashboard.tsx` `px-4` → `px-5`. `ChatBot.tsx` `px-4` → `px-5` on header, message list, and composer.

### [P1] One amber hue carries six different meanings
**Observed:** All screens, dark. Amber is: the active tab, the "Today" badge, the completed-set checkmark, the exercise progress bar, the PR gold medal, the primary CTA gradient, the "Plan Updated" chat badge, and the AI provider selection. The only non-amber status colour in the app is a `text-green-300` "✓ Done" badge that sits on a `bg-amber-600/20` pill (`DayCard.tsx`).
**Why it's wrong:** If everything is the accent, nothing is. HIG: colour should encode state, not decorate. The green-on-amber Done badge is the tell — the author needed a second colour and had no system to reach for.
**Action:** In `src/index.css` `:root`, add semantic tokens and use them everywhere: `--c-accent:#ea580c` (interactive/primary), `--c-done:#4ade80` (completed), `--c-today:#fbbf24` (today marker), `--c-rest:#94a3b8` (rest day), `--c-danger:#f87171`. Redefine each under `:root[data-theme='light']` as `#c2410c`, `#15803d`, `#b45309`, `#64748b`, `#b91c1c`. In `DayCard.tsx`, change the Done badge from `text-green-300 bg-amber-600/20` to `text-[var(--c-done)] bg-[color-mix(in_srgb,var(--c-done)_18%,transparent)]`. In `DayCard.tsx`, render rest days with `--c-rest` instead of pulling `DAY_ACCENT_COLORS[dayIndex]`.

### [P1] Day gradients are decorative noise that pretend to be information
**Observed:** Plan tab, both viewports, both themes. `src/types/index.ts` exports `DAY_GRADIENTS_DARK`/`LIGHT` — seven gradients indexed by `dayIndex % 7`, plus `DAY_ACCENT_COLORS` indexed the same way. So Thursday is yellow and Friday is pink for no reason. In light mode the effect is a row of highlighter smears; a rest day and a leg day can be the same colour family.
**Why it's wrong:** Colour applied by index is colour applied by coincidence. The user learns to ignore it, which also kills the colour you actually need (today, done, rest).
**Action:** Delete `DAY_GRADIENTS_DARK`, `DAY_GRADIENTS_LIGHT`, `dayGradients()` and `DAY_ACCENT_COLORS` from `src/types/index.ts`. In `DayCard.tsx`, replace the gradient/scrim pair (`bg-gradient-to-br ${gradient}` + `bg-black/30`) with a single flat surface `bg-white/[0.045]` (dark) that the light-theme remap already handles, and key the left accent bar off state instead: 3px inset left border using `--c-today` when `isToday`, `--c-done` when `day.completed`, `--c-rest` when `day.isRestDay`, otherwise transparent.

### [P1] No visible keyboard focus anywhere
**Observed:** Every screen. `input-glass` sets `outline-none` in `src/index.css` and nothing defines `:focus-visible` for `button`. Tabbing through the Plan tab produces no visible indicator at all.
**Why it's wrong:** WCAG 2.4.7 and basic desktop usability. The app is a PWA that also opens on a laptop.
**Action:** In `src/index.css` `@layer base`, add `:where(button, a, input, select, textarea):focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; border-radius: inherit; }`. Keep the existing `.input-glass:focus` glow as the mouse-focus treatment.

### [P1] Icon-only buttons have no accessible name; the tab bar is not a tab bar
**Observed:** `AppLayout.tsx` — theme and settings buttons carry only `title=`, which does not expose an accessible name on iOS VoiceOver. The set-row Done buttons in `WorkoutTracker.tsx` and the expand chevrons in `DayCard.tsx` have no label at all. The nav is a `<div>` of `<button>`s with no `role`/`aria-selected`.
**Why it's wrong:** VoiceOver reads the set checkbox as "button" five times in a row with no way to tell which set.
**Action:** In `AppLayout.tsx`, add `aria-label="Switch to light theme"` / `"Switch to dark theme"` (derived from `theme`) and `aria-label="Profile and settings"`. Add `role="tablist"` to the nav's inner flex container and `role="tab" aria-selected={isActive}` to each tab button. In `WorkoutTracker.tsx`, add `aria-label={\`Mark set ${set.setNumber} complete\`}` / `\`Undo set ${set.setNumber}\`` to the two Done buttons. In `DayCard.tsx`, add `aria-expanded={expanded}` to the header button.

### [P2] Everything animates with an overshoot bounce, and reduced-motion is ignored
**Observed:** `src/index.css` defines `--lg-bounce: cubic-bezier(0.175, 0.885, 0.32, 2.2)` — a 2.2 overshoot — applied at `0.4s` to `.glass-hover`, `.lg-container`, `.btn-primary`, `.btn-glass`, `.hover-lift`, and inline on every nav tab. Tapping a tab makes the pill spring past its size and settle.
**Why it's wrong:** HIG: motion should communicate, not perform. A 400ms springy transition on a tab bar delays feedback past the 100ms perceptual threshold and makes the app feel loose rather than precise. No `prefers-reduced-motion` guard exists at all.
**Action:** In `src/index.css`, change `--lg-bounce` to `cubic-bezier(0.32, 0.72, 0, 1)` (the iOS standard curve) and drop the durations from `0.4s` to `0.22s` in `.glass-hover`, `.lg-container`, `.btn-primary`, `.btn-glass`, `.hover-lift`. Keep the spring only on `:active` scale. Add at the end of the file: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }`.

### [P2] Emoji are being used as the icon system
**Observed:** 🏋️ (app mark), 😴 (rest day), 🎉 (workout complete), ⏱️ (rest timer), 🤖 (coach avatar), 🏔️ (shoulder day, `CATEGORY_EMOJI` in `WorkoutTracker.tsx`), 🍑 (glutes), 🫁 (chest), ✅⚡🎯🔥🏆📊 (Progress stat cards).
**Why it's wrong:** Emoji cannot be tinted, do not respect the theme, render differently per platform, and are read aloud by VoiceOver as their Unicode names ("mountain" for shoulder day). A stat card headed 🫁 is not a fitness app, it is a chat message.
**Action:** Replace the `CATEGORY_EMOJI` map in `WorkoutTracker.tsx` and the `emoji` prop of `StatCard` in `ProgressDashboard.tsx` with inline 20px stroke SVGs matching the 1.5px-stroke set already used in `AppLayout.tsx`'s `TABS`. Keep emoji only in `GOAL_META` (`src/types/index.ts`), where they are user-facing personality, not UI chrome.

### [P1] Switching tabs preserves the previous tab's scroll offset
**Observed:** Mobile, both themes. Scroll the Plan tab to the bottom, tap Progress, tap Plan — you land mid-list with "Tuesday" cut off at the top and no header. During the 400ms fade this reads as a blank screen.
**Why it's wrong:** Every iOS tab bar resets a tab to its top when you re-enter it from another tab; a second tap on an already-active tab is what scrolls to top. Restoring an offset the user did not set is disorienting.
**Action:** In `src/components/layout/AppLayout.tsx`, give the `<main>` inner wrapper a `key={activeTab}` so the scroll container remounts on tab change, or add a `useEffect` in each view keyed on mount that sets `scrollTop = 0`. Additionally wire a second tap on the already-active tab in `TABS.map` to scroll the active container to top.

### [P2] `h-[100dvh]` + `overflow-hidden` kills native scroll behaviour
**Observed:** `AppLayout.tsx` root is `h-[100dvh] bg-app flex flex-col overflow-hidden`. Installed as a PWA there is no pull-to-refresh, no rubber-band overscroll, and iOS Safari's URL bar collapse never triggers.
**Why it's wrong:** Overscroll bounce is the main cue that a list has ended. Removing it makes the app feel like a webview in a box.
**Action:** In `AppLayout.tsx`, keep `h-[100dvh]` but remove `overflow-hidden` from the root and add `overscroll-behavior-y: contain` to the per-tab scroll containers (`WeeklyPlanView`, `WorkoutTracker`, `ProgressDashboard` roots, which already carry `overflow-y-auto`).

### [P2] `no-scrollbar` is applied to every scroll container including horizontal ones
**Observed:** `WorkoutTracker.tsx` day-chip strip and all four tab roots use `.no-scrollbar`. On desktop at 1440×900 the Progress tab is a tall scrolling page with no scrollbar at all — there is no indication the page continues below the fold.
**Why it's wrong:** Hiding the scrollbar on a phone is correct; hiding it on a pointer device removes the only affordance for "there is more".
**Action:** In `src/index.css`, scope the rule: `@media (hover: hover) and (pointer: fine) { .no-scrollbar::-webkit-scrollbar { display: block; width: 8px; } .no-scrollbar { scrollbar-width: thin; } }`.

---

## Plan

### [P0] At desktop width every card is 1404px wide
**Observed:** Plan tab, 1440×900, light. Measured live: `main` = 1436px, its inner wrapper = 1436px, each day card = 1404px. A card reading "Mo · Monday · Chest & Triceps" on the left and "4 ex ⌄" on the right has roughly 1200px of dead space between them. The `max-w-2xl lg:max-w-4xl mx-auto` classes present in `AppLayout.tsx` source are **not in the deployed build** — the live inner wrapper's className is just `h-full`.
**Why it's wrong:** An unbounded measure is the single most obvious "this was only ever designed for a phone" signal. It also breaks `lg:grid-cols-2` in `WeeklyPlanView.tsx`, which never gets a chance to lay the week out as a grid.
**Correction (verified):** the deploy was current. The live bundle hash matched local `dist/`, and it did contain `max-w-2xl`. The reviewer was served a **stale shell by the service worker** — `public/sw.js` was cache-first on navigations, so `index.html` kept pointing at the bundle that was current on first visit. Fixed: navigations are now network-first, hashed assets stay cache-first, cache bumped to `gymbuddy-v2`.
**Action:** Then in `AppLayout.tsx` move the constraint onto the scroll containers, not the wrapper: keep `<main className="relative z-10 flex-1 min-h-0">` and change its child to `className="h-full w-full max-w-[680px] lg:max-w-[960px] mx-auto"`. Confirm after deploy that `document.querySelector('main').firstElementChild.className` contains the max-width classes.

### [P1] Today's workout appears twice on one screen
**Observed:** Plan tab, mobile, dark. The hero button reads "TODAY · Shoulders & Arms · 4 exercises". Six rows below, the Saturday row reads "Saturday · TODAY · Shoulders & Arms · 4 ex". Identical content, two different visual treatments, one screen.
**Why it's wrong:** Redundancy at the top of a list trains the user to scroll past the hero. It also costs a full card height on a 812px screen.
**Action:** In `src/components/plan/WeeklyPlanView.tsx`, when the hero (`todayPlan && !isRestDay && !completed`) renders, filter today's day out of the `plan.days.map` below it, or collapse today's row to a one-line "↑ shown above" reference. Prefer the former: change `{plan.days.map((day) => (` to `{plan.days.filter(d => !(showHero && d.dayIndex === todayIndex)).map((day) => (`.

### [P1] A day row's only action is "expand"; you cannot start a workout from it
**Observed:** Plan tab, mobile. Tapping the Thursday card expands a read-only exercise list. There is no control anywhere in the expanded panel to open Thursday in the tracker. The only route into a non-today workout is: Workout tab → horizontal chip strip → find the day.
**Why it's wrong:** The Plan is where the user decides what to do; the decision and the action should be one tap apart. Splitting them makes the Plan tab a brochure.
**Action:** In `src/components/plan/DayCard.tsx`, add an `onStart` prop and render, at the bottom of the expanded panel, a full-width 44px `btn-primary` reading "Start {day.focus}". Wire it in `WeeklyPlanView.tsx` to `setActiveTab('workout')` plus a new `setSelectedWorkoutDay(day.dayIndex)` lifted into `AppContext` (currently `selectedDayIndex` is local state inside `WorkoutTracker.tsx` and cannot be addressed from outside).

### [P1] "Regenerate Plan" is a destructive button with no confirmation and no warning
**Observed:** Plan tab, bottom of the list, mobile. A full-width ghost button. Tapping it calls `generateWeeklyPlan` and `setPlan(newPlan)` — replacing the week, including every set already logged. Without an API key it spins and then fails silently (`finally { setRegenerating(false) }` — the `catch` is absent, so the error surfaces nowhere).
**Why it's wrong:** HIG: destructive actions require confirmation and must state what is lost. Silent failure on the primary AI action is worse — the button spins, stops, and nothing changes, with no explanation.
**Action:** In `src/components/plan/WeeklyPlanView.tsx`, wrap `handleRegenerate` in a confirmation sheet naming the loss ("Replaces this week's plan. 3 logged sets will be discarded."). Add a `catch` that sets an `error` state and renders an inline error card above the button with a "Set up AI provider" action that calls `setActiveTab('settings')`. Style the button as a secondary action, not a full-width one — cap it at `max-w-[240px] mx-auto`.

### [P1] Completed days are dimmed rather than marked
**Observed:** Plan tab, mobile, dark. `DayCard.tsx` applies `${day.completed ? 'opacity-70' : ''}` to the whole card, so Monday and Tuesday — your two wins this week — are the two hardest rows to read.
**Why it's wrong:** Opacity is the disabled affordance. Completed work is the opposite of disabled; it is the thing you want to see.
**Action:** In `src/components/plan/DayCard.tsx`, remove `opacity-70`. Signal completion with the `--c-done` left accent bar, a filled progress bar, and the existing "✓ Done" pill recoloured per the cross-cutting colour finding.

### [P2] Three of seven rows are rest days with identical body copy
**Observed:** Plan tab, mobile. Wednesday, Friday and Sunday each render a full-height card with "😴 Rest Day" and the string "Active recovery, stretching & rest". That is ~40% of the screen spent saying nothing three times.
**Why it's wrong:** Uniform card height implies uniform importance. Rest days are context, not content.
**Action:** In `src/components/plan/DayCard.tsx`, add a compact branch for `day.isRestDay`: a 40px single-line row — day pill, "Rest", no body copy, no progress bar, `--c-rest` accent. Delete the "Active recovery, stretching & rest" block entirely.

### [P2] The week's completion ring duplicates the Progress tab's ring
**Observed:** Plan tab shows a 64px ring reading "50%". Progress tab shows a 96px ring reading "50%" plus a stat card reading "50 % Week Completion".
**Why it's wrong:** The same number rendered three ways across two tabs is not reinforcement, it is indecision about where it lives.
**Action:** Keep the ring on Plan (it is the week view) and delete the `StatCard label="Week Completion"` from `src/components/progress/ProgressDashboard.tsx`'s stats grid; keep the larger ring there since it carries the day-dot breakdown.

### [P2] "4 ex" is a developer abbreviation
**Observed:** Every workout row on the Plan tab, both viewports.
**Why it's wrong:** There is room for "4 exercises" at 375px; the hero card two rows above already writes it out in full.
**Action:** In `src/components/plan/DayCard.tsx`, change `` `${totalExercises} ex` `` to `` `${totalExercises} exercises` `` and let it truncate on the narrowest case; or show `${completedExercises}/${totalExercises}` which is more useful than either.

---

## Workout

### [P0] In light mode the weight and reps fields are invisible
**Observed:** Workout tab, mobile 375×812, **light**. The set rows show bare numerals "45" and "8" floating on a flat beige field. `.input-glass` is `background: rgba(255,255,255,0.05)` with `inset 1px 1px 0 rgba(255,255,255,0.12)` — both white-on-white on a `#f6f1ea` page. The Done checkbox is a pale grey tick in a pale grey square, roughly 1.6:1 against its row.
**Why it's wrong:** On the app's single most important screen, in one of its two shipped themes, the user cannot see that the numbers are editable or that the checkbox is a control. WCAG requires 3:1 for UI component boundaries.
**Action:** In `src/index.css`, the `:root[data-theme='light']` block does not override `.input-glass` at all — add it: `:root[data-theme='light'] .input-glass { background: #fff; box-shadow: inset 0 0 0 1px rgba(42,31,24,0.18); color: var(--ink); }` and `:root[data-theme='light'] .input-glass:focus { box-shadow: inset 0 0 0 1px var(--c-accent), 0 0 0 3px color-mix(in srgb, var(--c-accent) 25%, transparent); }`. In `WorkoutTracker.tsx`, change the uncompleted Done button's `bg-white/[0.08] border-white/15` to a token pair that the light remap covers, and its icon from `text-white/40` to `text-white/70`.

### [P1] The selected day is scrolled off the right edge of the chip strip
**Observed:** Workout tab, mobile, dark, on a Saturday. The horizontal chip strip shows Mon ✓ · Tue ✓ · Wed 😴 · Thu · Fri 😴, with the Saturday chip clipped at the right edge. Saturday is the selected day — its header fills the screen below — but its chip is not visible.
**Why it's wrong:** A selection control that does not show the current selection is broken. The user's first impression is that no day is selected.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`, add a ref to the selected chip and a `useEffect` on `selectedDayIndex` calling `ref.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })`. Add `scroll-snap-type: x mandatory` to the strip and `scroll-snap-align: center` to each chip.

### [P1] Logging a set shoves the next set out from under your thumb
**Observed:** Workout tab, mobile, dark. Tapping Done on set 1 inserts the rest-timer card (`mx-4 mb-3 p-3 rounded-xl`, ~56px tall) **above** the exercise list, pushing every set row down by 78px. Set 2's Done button lands where set 1's was two rows ago.
**Why it's wrong:** HIG: never move a control in response to a tap on a nearby control. The user is about to tap again in the same region; you have moved the target mid-gesture.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`, take the rest timer out of document flow. Render it as a fixed pill anchored above the tab bar: `fixed inset-x-5 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-30` with the same glass treatment. Nothing in the list moves.

### [P1] The day header progress does not move when you log a set
**Observed:** Workout tab, mobile. After completing 1 of Overhead Press's 4 sets, the header still reads "0/4 exercises" and the header bar is still empty; only the collapsed exercise row's subtitle changes to "1/4 done".
**Why it's wrong:** The largest progress indicator on screen is unresponsive to the primary action. Sets are the unit of work; exercises are the unit of grouping.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`, compute `completedSets`/`totalSets` across `selectedDay.exercises` and drive the header bar from that. Keep the exercise count as secondary text: `"{completedSets}/{totalSets} sets · {completedCount}/{totalCount} exercises"`.

### [P1] Completing the last set of an exercise does nothing to advance you
**Observed:** Workout tab, mobile. After the 4th set of Overhead Press is logged, the panel stays open showing four greyed rows; Lateral Raise stays collapsed below. The user must scroll, find the next exercise, and tap its header.
**Why it's wrong:** The tracker knows what is next. Making the user re-navigate after every exercise is the largest avoidable tap cost in the app.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`'s `completeSet`, when `allDone` is true for the exercise, `setActiveExerciseId(nextIncompleteExerciseId)` and scroll it into view. When the whole day completes, show the celebration card and auto-scroll to it.

### [P1] A completed set is locked — a typo needs two taps to fix
**Observed:** Workout tab. Both `<input>`s carry `disabled={set.completed}`. To change 45kg to 47.5kg after logging, the user taps the amber check (un-complete), edits, then taps check again.
**Why it's wrong:** Editing a logged value is a normal, frequent action (you racked a different plate than planned). Locking it treats a log entry as a commitment.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`, remove `disabled={set.completed}` from both inputs. On change while `set.completed`, call a new `updateSet(dayIndex, exerciseId, setNumber, {weight, reps})` that patches the set and the corresponding progress entry in place. Keep the check button as the completion toggle only.

### [P1] The set row does not tell you what you lifted last time
**Observed:** Workout tab, mobile. Each row offers an empty-looking weight field pre-filled with the plan's target. There is no reference to the previous session for that exercise, despite `progressHistory` and `records` both being in `AppContext`.
**Why it's wrong:** Progressive overload is the entire premise of the app's stated goal ("Build lean muscle mass with progressive overload"). The number a lifter needs at the moment of entry is last week's number.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`'s `ExerciseBlock`, accept a `lastSession` prop derived from `progressHistory.filter(e => e.exerciseName === exercise.name)` (most recent date). Render it as a `.t-caption` line under the exercise title: `"Last: 45kg × 8, 8, 7 · Sep 3"`, and add a 44px "Use last" chip that fills every weight field with that value.

### [P1] The rest timer is a fixed 60 seconds with no controls and no alert
**Observed:** Workout tab. `startRestTimer(60)` is hardcoded in `completeSet`. The card offers only "Skip" as 12px text. It counts to zero and vanishes with no sound, no haptic, and no visual end state.
**Why it's wrong:** Rest interval is exercise-specific (90–180s for a compound, 45s for an isolation) and the user is not looking at the phone while resting — the whole point of the timer is that it tells you when to look.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`, derive the default from the exercise category (compound categories `chest`/`back`/`legs`/`full-body` → 120s; others → 60s) and expose `−15s` / `+15s` / `Skip` as three 44px controls in the fixed timer pill. On expiry call `navigator.vibrate?.(200)` and flash the pill to `--c-done` for 1.5s before dismissing. Add a rest-duration override to `SettingsView.tsx`.

### [P2] There is no way to add, drop, or skip anything
**Observed:** Workout tab. The set list is exactly what `buildDemoPlan`/`generateWeeklyPlan` produced. No "+ Add set", no way to mark an exercise skipped, no substitution when the rack is taken.
**Why it's wrong:** Real sessions deviate. An app that cannot record a deviation gets abandoned the first time the gym is busy.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`, add a full-width 44px "+ Add set" ghost button at the bottom of the expanded set list (appends a `WorkoutSet` copying the previous set's weight/reps), and a trailing overflow button on the exercise header offering "Skip exercise" and "Swap exercise".

### [P2] There is no explicit "Finish workout"
**Observed:** Workout tab. Completion is implicit — `allExDone` flips `day.completed` and a 🎉 card appears at the bottom of the list.
**Why it's wrong:** Finishing a workout is the emotional peak of the session and the natural moment to show a summary (total volume, PRs hit, duration). Right now it is a passive banner you may never scroll to.
**Action:** In `src/components/tracker/WorkoutTracker.tsx`, replace the inline completion card with a full-screen summary sheet on the transition to `day.completed`: total volume lifted, sets completed, any exercise where `weight > records[name].weight` flagged as a new PR, and a primary "Done" button returning to the Plan tab.

### [P2] The category emoji picked for the day is chosen from the first exercise only
**Observed:** Workout tab, Saturday header shows 🏔️ at `text-4xl` because `CATEGORY_EMOJI[selectedDay.exercises[0]?.category]` resolves `shoulders` → mountain. Saturday is "Shoulders & Arms"; the mountain says nothing about arms.
**Why it's wrong:** A 36px glyph is the largest element in the header and it is derived from an array index.
**Action:** Covered by the cross-cutting emoji finding — replace with an SVG keyed off `day.focus`, or drop the glyph and give the header its space back.

---

## Progress

### [P0] The "Last 7 Days" chart renders nothing — every bar is 0px tall
**Observed:** Progress tab, mobile 375×812, both themes. An 80px-tall empty box with the label row "Sun Mon Tue Wed Thu Fri **Sat**" underneath. Measured live: the container is 80px, each of the seven columns is **17.5px** (the label only), each bar wrapper is **0px**, each bar is **0px** — even on a day with a logged set.
**Why it's wrong:** The parent is `flex items-end`, which stops the columns from stretching, so each column collapses to its label height; the inner `flex-1 w-full flex items-end` then has 0 height, and the bar's `height: ${pct}%` resolves against 0. The only trend visualisation in the app draws nothing, and has presumably never drawn anything.
**Action:** In `src/components/progress/ProgressDashboard.tsx`, change the chart container from `flex items-end gap-2 h-20` to `flex items-stretch gap-2 h-24`, and each column from `flex-1 flex flex-col items-center gap-1` to `flex-1 flex flex-col items-center gap-1 h-full`. Give the bar wrapper `flex-1 w-full flex items-end min-h-0`. Verify after the fix that a day with volume renders a bar taller than 4px.

### [P1] "This Week Volume" is rounded to whole tonnes, so it is usually 0
**Observed:** Progress tab, mobile. The card reads "**9** t". `stats.totalVolume` is `Math.round(totalVolume / 1000)`. A typical session of 4 exercises × 3 sets × 45kg × 8 reps is 4.3t — but a single logged set (45 × 8 = 360kg) reports **0 t**.
**Why it's wrong:** A metric that reads 0 after real work discourages the exact behaviour the app exists to encourage, and 1-tonne granularity cannot show week-over-week progress.
**Action:** In `src/components/progress/ProgressDashboard.tsx`, return `totalVolume` in kg and format at render: below 1000 show `${kg} kg`, at or above show `${(kg/1000).toFixed(1)} t`. Add a delta against the prior 7 days as a `.t-caption` line ("+12% vs last week") — the data is already in `progressHistory`.

### [P1] There is no per-exercise trend, which is the one chart a lifter wants
**Observed:** Progress tab. Available: four stat tiles, a completion ring, a broken 7-day bar chart, and a top-10 PR list ranked by absolute weight. Nothing shows "is my bench going up".
**Why it's wrong:** "Track your fitness journey" is the tab's subtitle and the tab cannot answer the journey's only question. Note `byExercise` is already computed in the `useMemo` and then discarded — the data is sitting there unused.
**Action:** In `src/components/progress/ProgressDashboard.tsx`, add an "Exercise trend" card below the PR list: a select populated from `Object.keys(byExercise)` defaulting to the highest-volume exercise, and a 120px sparkline of `maxWeight` over time with the first and last values labelled. Return `byExercise` from the `useMemo` instead of dropping it.

### [P1] The empty state renders *below* four zeroed stat cards and an empty chart
**Observed:** Progress tab with `progressHistory.length === 0`. The "📊 No data yet" card is the last block in the JSX, so the user first sees "0 t", "0 types", "0 %", "0", a 0% ring, and an empty chart, and only then is told there is no data.
**Why it's wrong:** An empty state must replace the content, not annotate it. Six zeros read as a broken app, not an empty one.
**Action:** In `src/components/progress/ProgressDashboard.tsx`, early-return the empty state when `progressHistory.length === 0 && !plan?.days.some(d => d.completed)`, keeping only the profile summary card above it. Give it a real action: a 44px primary button "Start today's workout" calling `setActiveTab('workout')`.

### [P2] Personal Records ranks by absolute weight across unrelated lifts
**Observed:** Progress tab, mobile. Deadlift 110kg is ranked #1 with a gold medal, Overhead Press 45kg is #4 with a grey disc. The gold/silver/bronze gradients are applied inline via `style` with hardcoded hex.
**Why it's wrong:** Ranking a deadlift above an overhead press tells the user nothing — every lifter deadlifts more than they press. The medal metaphor implies competition between your own lifts.
**Action:** In `src/components/progress/ProgressDashboard.tsx`, drop the medal gradients and the numeric rank entirely. Sort `recordsList` by `date` descending and label each row with how recently it was set plus the delta from the previous record for that lift ("+2.5kg since Aug 20"). Keep the 🏆 header as the section identity.

### [P2] The profile summary card buries BMI in a 10px tertiary line
**Observed:** Progress tab. "175cm · 76kg · BMI 24.8" at `text-white/30 text-xs`.
**Why it's wrong:** Either BMI matters (then it deserves a tile) or it does not (then it is noise). At 30% opacity it is neither.
**Action:** Remove the BMI fragment from the summary line in `src/components/progress/ProgressDashboard.tsx`. Height and weight belong in Settings; the Progress header should carry name, goal, and current streak.

---

## AI Coach

### [P0] A green "Always available" status dot above a coach that fails every message
**Observed:** AI Coach tab, mobile, dark. The header shows a pulsing green dot and "Always available". Tapping the first suggested prompt produced: user bubble, then "⚠️ Something went wrong. Please check your API key and try again." The status dot is still green and still pulsing.
**Why it's wrong:** The app asserts a system state it has not checked. `loadAIConfig()` already knows whether a key exists; claiming availability while unconfigured is the single most damaging trust failure in the product.
**Action:** In `src/components/chat/ChatBot.tsx`, import `loadAIConfig` from `../../services/aiConfig` and derive the header status from it: no key and no local base URL → amber dot + "Not connected"; configured → green dot + "Ready". Remove the string "Always available" entirely.

### [P0] The failure state is a dead-end chat bubble with no recovery action
**Observed:** AI Coach tab. The error arrives as an assistant message. There is no button, no link, no route to Settings, and no indication of which of the two providers is configured. The user's only option is to guess.
**Why it's wrong:** An error must offer the next step. This one names a cause ("your API key") and then abandons the user four scrolls away from the field that fixes it.
**Action:** In `src/components/chat/ChatBot.tsx`, replace the error `ChatMessage` with a distinct non-chat error card rendered below the message list: title "AI Coach isn't connected", body naming the configured provider, and a 44px primary button "Set up AI provider" calling `setActiveTab('settings')` (pull `setActiveTab` from `useApp()`). Add a secondary "Retry" that re-sends the last user message.

### [P0] The composer floats mid-screen with 400px of dead space beneath it
**Observed:** AI Coach tab, mobile 375×812, dark, after one exchange. The two message bubbles end at ~y340; the input row sits immediately below at ~y415; below that is empty background down to the tab bar at ~y860. The empty state fills the screen correctly, so the collapse happens as soon as messages exist.
**Why it's wrong:** The composer is the anchor of a chat UI and must be pinned to the bottom edge at all times. A composer that moves up and down with message count is a layout failure a user will read as a rendering bug.
**Action:** In `src/components/chat/ChatBot.tsx`, add `min-h-0` to the message list (`flex-1 overflow-y-auto no-scrollbar px-4 space-y-3` → `flex-1 min-h-0 overflow-y-auto ...`) so it absorbs the free space, and confirm the root `h-full flex flex-col` is receiving a bounded height from `AppLayout`'s `<main className="flex-1 min-h-0">`. The composer wrapper already has `flex-shrink-0`; it should then sit on the bottom edge with the message list scrolling above it.

### [P1] Six suggested prompts, none of which know anything about the user
**Observed:** AI Coach tab, empty state, mobile. `SUGGESTED_PROMPTS` is a hardcoded array of six generic strings, rendered as a vertical stack that pushes the composer off-screen. "Replace leg day with full body workout" is offered to a user whose plan may not have a leg day.
**Why it's wrong:** Suggested prompts earn their screen space only when they reference the user's actual state. Six generic ones are a wall of text in the highest-value real estate in the app.
**Action:** In `src/components/chat/ChatBot.tsx`, cut to three prompts and template them from `profile` and `plan`: `"How do I improve my ${plan.days.find(d=>d.dayIndex===todayIndex)?.focus} session?"`, `"I'm feeling tired — lighten today's workout"`, `"What should I eat for ${GOAL_META[profile.goal].label.toLowerCase()}?"`. Render them as a single horizontal scroll row of chips above the composer, not a vertical stack.

### [P1] No streaming, no stop, no copy, no retry
**Observed:** AI Coach tab. `handleSend` awaits the whole response, shows a three-dot bounce, then drops the full message in. There is no way to cancel a slow request, copy an answer, or retry a failure.
**Why it's wrong:** With a free OpenRouter model the wait can be 10+ seconds of an unresponsive screen with no cancel.
**Action:** In `src/components/chat/ChatBot.tsx`, thread an `AbortController` through `sendChatMessage` and swap the send button to a Stop button while `loading`. Add a long-press / trailing overflow on each assistant bubble with "Copy" and "Retry".

### [P2] The user and assistant avatars are the same gradient
**Observed:** AI Coach tab. `MessageBubble` sets both branches of the avatar to `bg-gradient-to-br from-amber-600 to-orange-700` — the ternary has identical arms.
**Why it's wrong:** Avatar colour is the fastest speaker cue; identical colours throw all the work onto bubble alignment.
**Action:** In `src/components/chat/ChatBot.tsx`, give the user avatar a neutral surface (`bg-white/10 text-white/70`) and keep the amber gradient for the coach only.

---

## Profile / Settings

### [P1] Changing your goal does nothing until you find the Regenerate button on another tab
**Observed:** Profile tab, mobile. Tapping "Weight Loss" moves the checkmark instantly. The section subtitle reads "Regenerate your plan after changing this". The plan does not change; the user must go to the Plan tab, scroll to the bottom, and tap Regenerate — a button that, per the Plan findings, silently fails without an API key.
**Why it's wrong:** The app is telling the user to perform its own follow-through. The goal is the single most consequential setting in the product and it is inert.
**Action:** In `src/components/settings/SettingsView.tsx`, on goal change show an inline confirmation row inside the Current Goal section: "Goal changed to Weight Loss — regenerate your plan?" with a 44px primary "Regenerate now" that calls `generateWeeklyPlan` directly and a "Later" dismiss. Delete the "Regenerate your plan after changing this" subtitle.

### [P1] The AI key — the gate on half the product — is the fourth section down
**Observed:** Profile tab, mobile. Order: Your Profile → Current Goal (6 rows) → Appearance → **AI Provider** → Profiles → Danger Zone. The user hits the AI Provider section only after roughly two full screens of scrolling, and nothing anywhere else in the app points here.
**Why it's wrong:** Two of five tabs (AI Coach, plus Regenerate on Plan) are non-functional until this field is filled, and the app never says so.
**Action:** In `src/components/settings/SettingsView.tsx`, move the AI Provider `<Section>` to the top of the list when no key is configured, and give it an amber "Not connected" status pill. Add a persistent dismissible banner to `AppLayout.tsx` shown when `loadAIConfig()` has neither a key nor a local base URL, with a single action routing to this section.

### [P1] Destructive actions use the browser's native `confirm()`
**Observed:** Profile tab, mobile. Both the per-profile "Delete" and the Danger Zone button call `confirm(...)`. On iOS Safari this is a system alert titled with the origin URL — "gym-buddy.nvkudva.workers.dev says".
**Why it's wrong:** A native `confirm` breaks the app's visual world at the exact moment the user needs to trust it, and shows a hostname instead of a consequence.
**Action:** Build a small `ConfirmSheet` component (bottom sheet, `--c-danger` primary, 44px buttons, explicit consequence text naming the profile and what is lost) and use it for both call sites in `src/components/settings/SettingsView.tsx`.

### [P1] Two different controls delete a profile, and one is in a section labelled "Danger Zone"
**Observed:** Profile tab. The Profiles section has a "Delete" text button per row (hidden when only one profile exists). The Danger Zone section below has a full-width red button that deletes the *current* profile. With one profile, the row control disappears and only Danger Zone works — a confusing, state-dependent difference.
**Why it's wrong:** Two paths to one irreversible action, with different affordances and different availability rules.
**Action:** In `src/components/settings/SettingsView.tsx`, delete the entire "Danger Zone" `<Section>`. Keep the per-row Delete, remove the `profiles.length > 1` guard (deleting the last profile should return to onboarding, which `deleteProfile` + `setActiveTab('plan')` already approximates), and make the row control a 44px icon button rather than 12px text.

### [P2] Profile edits save on every keystroke with no acknowledgement
**Observed:** Profile tab. `onChange={e => updateProfile({ name: e.target.value })}` fires per character; `updateProfile({ age: Number(e.target.value) })` writes `0` the moment the field is cleared. The AI section has a "Saved" flash; the profile section has none.
**Why it's wrong:** Inconsistent save semantics within one screen, plus a real data hazard — clearing the weight field writes `weight: 0`, which feeds `generateWeeklyPlan`.
**Action:** In `src/components/settings/SettingsView.tsx`, commit numeric fields on `onBlur` with a clamp (`age` 13–100, `height` 100–250, `weight` 30–300) and reuse the existing `saved` flash for the whole screen.

### [P2] Metric-only, and no workout preferences at all
**Observed:** Profile tab. Height is cm, weight is kg, set weights are kg, hardcoded in labels across `SettingsView.tsx`, `OnboardingFlow.tsx`, `WorkoutTracker.tsx` and `DayCard.tsx`. There is no rest-timer default, no unit toggle, no workouts-per-week control (it is captured in onboarding and then unreachable).
**Why it's wrong:** Unit preference is table stakes for a fitness app, and `workoutsPerWeek` is displayed on the Progress tab as "4x per week" while being uneditable.
**Action:** Add a "Units" section to `src/components/settings/SettingsView.tsx` with a kg/lb segmented control persisted alongside `AIConfig`, and a `formatWeight()` helper in `src/types/index.ts` used by every weight render site. Add `workoutsPerWeek` as a 3/4/5/6 segmented control reusing the markup from `OnboardingFlow.tsx` step 3.

---

## Onboarding

### [P0] A real new user reaches a dead end at "✨ Create My Plan"
**Observed:** Onboarding step 3, mobile, dark, no API key configured. `handleFinish` calls `generateWeeklyPlan(profile)`; without a provider it throws, and the catch renders a red box containing the raw message — "Error: Failed to fetch" or similar. The user has filled in three screens of personal data and is given a fetch error. Nothing in steps 1–3 mentions that an AI provider is required.
**Why it's wrong:** The very first thing the app does for a new user is fail with a developer-facing string and no way forward. The only path that works (`Skip setup — explore with the demo user`) is styled as a 12px de-emphasised text link.
**Action:** In `src/components/onboarding/OnboardingFlow.tsx`, add a step between goal and finish that asks for the AI provider, or — better — make `generateWeeklyPlan` fall back to the local rule-based generator when no provider is configured and never fail. Replace the raw `Error: ${msg}` box with a written message plus two 44px actions: "Add an AI key" and "Use a starter plan" (which seeds the deterministic plan). Never surface `err.message` verbatim.

### [P1] Equipment arrives pre-selected with barbell and dumbbells
**Observed:** Onboarding step 3, mobile. `useState<Equipment[]>(['dumbbells', 'barbell'])`. A home-workout user must first deselect two chips before selecting "Bodyweight Only".
**Why it's wrong:** A pre-filled answer to a question you are asking is a leading question; it also silently mis-configures the plan for anyone who taps through.
**Action:** In `src/components/onboarding/OnboardingFlow.tsx`, initialise `equipment` to `[]`. `canFinish` already requires `equipment.length > 0`, so the Continue button correctly stays disabled until a real choice is made.

### [P1] The `min`/`max` on the number inputs are decorative
**Observed:** Onboarding step 1, mobile. The inputs declare `min="13" max="100"` (age), `min="100" max="250"` (height), `min="30" max="300"` (weight), but `canStep1` only checks `Number(x) > 0`. Age 3 and weight 900 both pass through to `generateWeeklyPlan`.
**Why it's wrong:** Declaring a constraint and not enforcing it is worse than no constraint — nothing in the UI tells the user the value is out of range.
**Action:** In `src/components/onboarding/OnboardingFlow.tsx`, change `canStep1` to range-check each field against the same bounds, and render a `.t-caption` inline message in `--c-danger` under any out-of-range field rather than only disabling Continue.

### [P2] The disabled primary button reads as enabled
**Observed:** Onboarding step 1, mobile, dark, empty form. `.btn-primary:disabled` is `opacity: 0.5` over an amber-to-orange gradient, which renders as a muted brown pill with legible white-ish text — it looks like a normal button in this dark palette.
**Why it's wrong:** Disabled state must be unmistakable; a 50% amber gradient on a near-black ground is not.
**Action:** In `src/index.css`, change `.btn-primary:disabled` to `{ background: rgba(255,255,255,0.06); box-shadow: none; color: rgba(255,255,255,0.28); opacity: 1; cursor: not-allowed; }` with a light-theme counterpart under `:root[data-theme='light']`.

### [P2] "Skip setup — explore with the demo user" is a 12px underlined text link
**Observed:** Onboarding step 1, mobile. `text-white/40 ... text-xs underline underline-offset-4` — roughly 16px tall, 40% opacity, below the card.
**Why it's wrong:** This is currently the only path that reliably produces a working app, and it is the least visible control on the screen. It is also far below 44pt.
**Action:** In `src/components/onboarding/OnboardingFlow.tsx`, promote it to a full-width 44px `btn-glass` directly under the card reading "Explore with demo data", and show it on all three steps, not just step 1.

### [P2] No review step and no way back into an answer after finishing
**Observed:** Onboarding. Step 3 ends with "✨ Create My Plan" and no summary of the four decisions just made. After finishing, `workoutsPerWeek`, `experience`, and `equipment` are not editable anywhere in Settings.
**Why it's wrong:** Three of the four inputs that shape the generated plan become read-only the moment onboarding ends.
**Action:** Add a compact summary block above the step-3 buttons in `src/components/onboarding/OnboardingFlow.tsx` (goal · experience · equipment count · frequency, each tappable to jump back), and surface `experience` and `equipment` as editable sections in `src/components/settings/SettingsView.tsx`.

---

## Click-reduction audit

| Task | Taps today | Taps after fix | How |
|---|---|---|---|
| Start today's workout (from cold open on Plan) | **2** — tap Today hero → tap exercise header to expand | **0** | On launch, if today is an incomplete workout day, open the Workout tab with today selected and the first incomplete exercise already expanded. Change the initial `activeTab` in `AppContext` to be state-derived, and initialise `activeExerciseId` in `WorkoutTracker.tsx` to the first incomplete exercise instead of `null`. |
| Log a set at the planned weight | **2** for the first set (expand + check), **1** after | **1**, always | Auto-expand the first incomplete exercise (above) removes the expand tap. Then `completeSet` auto-advances to the next exercise so the next set is always one tap away. |
| Log a set at a *different* weight | **5** — tap field, select-all, type, dismiss keyboard, tap check | **2** | Add 44px `−2.5 / +2.5` steppers flanking the weight field in `WorkoutTracker.tsx`'s set row. One tap adjusts, one tap logs; the keyboard never opens. |
| Start a workout that is not today | **3** — Workout tab → scroll chip strip → tap chip (the selected chip is off-screen, so add a swipe) | **1** | Add the "Start {focus}" button to the expanded `DayCard.tsx` panel and lift `selectedDayIndex` into `AppContext` so the Plan can address it directly. |
| Check last week's volume | **impossible** — Progress shows only "This Week Volume", and the 7-day chart renders no bars at all | **1** | Fix the zero-height bar chart in `ProgressDashboard.tsx`, and add a "vs last week" delta line to the volume tile computed from `progressHistory` — the comparison then needs no navigation. |
| See whether a lift is going up | **impossible** — no per-exercise trend exists | **2** | Add the "Exercise trend" card to `ProgressDashboard.tsx` using the already-computed-and-discarded `byExercise` map: Progress tab → pick exercise. |
| Change goal (and have it take effect) | **4** — Profile tab → tap goal → Plan tab → tap Regenerate (which then fails silently without a key) | **2** | Inline "Regenerate now" confirmation inside the Current Goal section of `SettingsView.tsx`. |
| Ask the coach a question | **2** — AI Coach tab → tap a suggested prompt (then it fails, with no recovery tap available at all) | **2**, and it works | Context-aware prompt chips plus a real "Set up AI provider" action in the error card. |
| Fix a mistyped logged weight | **4** — tap check to un-complete, tap field, retype, tap check | **2** | Remove `disabled={set.completed}` and patch in place via a new `updateSet` action. |
| Reach the AI key field from a failed coach message | **5** — Profile tab → scroll past 3 sections → tap field (no in-app pointer exists) | **1** | "Set up AI provider" button in the chat error card, routing to a re-ordered Settings with AI Provider first. |

---

## Recommended order of work

1. **Fix the three things that are visibly broken.** The zero-height "Last 7 Days" chart in `ProgressDashboard.tsx`, the collapsing chat composer in `ChatBot.tsx`, and the missing desktop max-width in `AppLayout.tsx` (verify the deploy is current first — the live bundle is behind the source). These are cheap and they are the ones a reviewer screenshots.
2. **Make the app stop lying about the AI Coach.** Derive the header status from `loadAIConfig()`, replace the dead-end error bubble with an error card that routes to Settings, move AI Provider to the top of Settings, and give `generateWeeklyPlan` a deterministic fallback so onboarding can never end in a raw fetch error.
3. **Rebuild the set row.** 44px inputs and Done buttons, ±2.5kg steppers, editable completed sets, last-session reference, and a set-based header progress bar. This is the app's core loop and every change here pays back on every session.
4. **Remove the taps.** Launch straight into today's workout with the first incomplete exercise open; auto-advance on exercise completion; scroll the selected day chip into view; add "Start" to the expanded day card; inline "Regenerate now" on goal change.
5. **Lay in the design system.** The six-step type scale, the 20px gutter, the five semantic colour tokens, and the focus-visible rule — all in `src/index.css`. Do this before the cosmetic pass so the cleanup has something to target.
6. **Delete the decoration.** Index-keyed day gradients, `opacity-70` on completed days, the medal ranks, the duplicated today card, the duplicated 50% readouts, the three identical rest-day cards, and the emoji icon set. Every one of these frees space that the real content needs.
7. **Give Progress something to say.** Per-exercise trend sparkline, kg-resolution volume with a week-over-week delta, a real empty state with an action, and PRs sorted by recency with deltas.
8. **Accessibility and motion pass.** aria-labels on every icon button, `role="tablist"` on the nav, the 0.22s standard curve, `prefers-reduced-motion`, and a light-theme contrast sweep — starting with `.input-glass`, which is currently invisible on paper.
9. **Onboarding polish.** Empty equipment default, enforced ranges, a real disabled button style, the demo path promoted to a proper button, and a review step that stays editable from Settings afterwards.
