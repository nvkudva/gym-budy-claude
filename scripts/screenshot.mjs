import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const URL = 'http://localhost:5173';

const MOCK_PROFILE = {
  id: 'user-demo',
  name: 'Alex',
  age: 27,
  height: 178,
  weight: 75,
  goal: 'muscle-gain',
  experience: 'intermediate',
  equipment: ['barbell', 'dumbbells', 'machines'],
  workoutsPerWeek: 5,
  createdAt: new Date().toISOString(),
};

const MOCK_PLAN = {
  id: 'plan-demo',
  userId: 'user-demo',
  weekLabel: 'Week of Mar 28',
  generatedAt: new Date().toISOString(),
  days: [
    {
      dayIndex: 0, dayName: 'Monday', focus: 'Chest & Triceps', isRestDay: false, completed: true,
      exercises: [
        { id: 'e1', name: 'Barbell Bench Press', category: 'chest', targetMuscles: ['chest', 'triceps'], completed: true,
          sets: [{ setNumber:1, plannedReps:8, weight:80, completed:true }, { setNumber:2, plannedReps:8, weight:80, completed:true }, { setNumber:3, plannedReps:8, weight:75, completed:true }, { setNumber:4, plannedReps:8, weight:75, completed:true }] },
        { id: 'e2', name: 'Incline Dumbbell Press', category: 'chest', targetMuscles: ['upper chest'], completed: true,
          sets: [{ setNumber:1, plannedReps:10, weight:30, completed:true }, { setNumber:2, plannedReps:10, weight:30, completed:true }, { setNumber:3, plannedReps:10, weight:28, completed:true }] },
        { id: 'e3', name: 'Tricep Pushdown', category: 'triceps', targetMuscles: ['triceps'], completed: true,
          sets: [{ setNumber:1, plannedReps:15, weight:25, completed:true }, { setNumber:2, plannedReps:15, weight:25, completed:true }, { setNumber:3, plannedReps:15, weight:25, completed:true }] },
      ],
    },
    {
      dayIndex: 1, dayName: 'Tuesday', focus: 'Back & Biceps', isRestDay: false, completed: false,
      exercises: [
        { id: 'e4', name: 'Barbell Deadlift', category: 'back', targetMuscles: ['lower back', 'hamstrings'], completed: false,
          sets: [{ setNumber:1, plannedReps:5, weight:120, completed:false }, { setNumber:2, plannedReps:5, weight:120, completed:false }, { setNumber:3, plannedReps:5, weight:110, completed:false }, { setNumber:4, plannedReps:5, weight:110, completed:false }] },
        { id: 'e5', name: 'Pull-Up', category: 'back', targetMuscles: ['lats', 'biceps'], completed: false,
          sets: [{ setNumber:1, plannedReps:8, weight:0, completed:false }, { setNumber:2, plannedReps:8, weight:0, completed:false }, { setNumber:3, plannedReps:8, weight:0, completed:false }] },
        { id: 'e6', name: 'Barbell Curl', category: 'biceps', targetMuscles: ['biceps'], completed: false,
          sets: [{ setNumber:1, plannedReps:12, weight:25, completed:false }, { setNumber:2, plannedReps:12, weight:25, completed:false }, { setNumber:3, plannedReps:12, weight:22, completed:false }] },
      ],
    },
    { dayIndex: 2, dayName: 'Wednesday', focus: 'Rest', isRestDay: true, completed: false, exercises: [] },
    {
      dayIndex: 3, dayName: 'Thursday', focus: 'Shoulders & Arms', isRestDay: false, completed: false,
      exercises: [
        { id: 'e7', name: 'Overhead Press', category: 'shoulders', targetMuscles: ['front deltoid'], completed: false,
          sets: [{ setNumber:1, plannedReps:8, weight:50, completed:false }, { setNumber:2, plannedReps:8, weight:50, completed:false }, { setNumber:3, plannedReps:8, weight:45, completed:false }] },
        { id: 'e8', name: 'Lateral Raise', category: 'shoulders', targetMuscles: ['side deltoid'], completed: false,
          sets: [{ setNumber:1, plannedReps:15, weight:12, completed:false }, { setNumber:2, plannedReps:15, weight:12, completed:false }, { setNumber:3, plannedReps:15, weight:10, completed:false }] },
      ],
    },
    {
      dayIndex: 4, dayName: 'Friday', focus: 'Legs & Glutes', isRestDay: false, completed: false,
      exercises: [
        { id: 'e9', name: 'Barbell Squat', category: 'legs', targetMuscles: ['quads', 'glutes'], completed: false,
          sets: [{ setNumber:1, plannedReps:8, weight:90, completed:false }, { setNumber:2, plannedReps:8, weight:90, completed:false }, { setNumber:3, plannedReps:8, weight:85, completed:false }, { setNumber:4, plannedReps:8, weight:85, completed:false }] },
        { id: 'e10', name: 'Hip Thrust', category: 'glutes', targetMuscles: ['glutes'], completed: false,
          sets: [{ setNumber:1, plannedReps:12, weight:80, completed:false }, { setNumber:2, plannedReps:12, weight:80, completed:false }, { setNumber:3, plannedReps:12, weight:75, completed:false }] },
      ],
    },
    { dayIndex: 5, dayName: 'Saturday', focus: 'Core & Cardio', isRestDay: false, completed: false,
      exercises: [
        { id: 'e11', name: 'Plank', category: 'core', targetMuscles: ['core'], completed: false,
          sets: [{ setNumber:1, plannedReps:60, weight:0, completed:false }, { setNumber:2, plannedReps:60, weight:0, completed:false }, { setNumber:3, plannedReps:60, weight:0, completed:false }] },
        { id: 'e12', name: 'Treadmill Run', category: 'cardio', targetMuscles: ['cardiovascular'], completed: false,
          sets: [{ setNumber:1, plannedReps:20, weight:0, completed:false }] },
      ],
    },
    { dayIndex: 6, dayName: 'Sunday', focus: 'Rest', isRestDay: true, completed: false, exercises: [] },
  ],
};

const MOCK_PROGRESS = [
  { id:'p1', date: new Date(Date.now() - 6*864e5).toISOString(), exerciseName:'Barbell Bench Press', totalVolume:2400, maxWeight:80, totalReps:8, sets:4 },
  { id:'p2', date: new Date(Date.now() - 6*864e5).toISOString(), exerciseName:'Incline Dumbbell Press', totalVolume:900, maxWeight:30, totalReps:10, sets:3 },
  { id:'p3', date: new Date(Date.now() - 5*864e5).toISOString(), exerciseName:'Barbell Deadlift', totalVolume:2400, maxWeight:120, totalReps:5, sets:4 },
  { id:'p4', date: new Date(Date.now() - 4*864e5).toISOString(), exerciseName:'Overhead Press', totalVolume:1200, maxWeight:50, totalReps:8, sets:3 },
  { id:'p5', date: new Date(Date.now() - 3*864e5).toISOString(), exerciseName:'Barbell Squat', totalVolume:2880, maxWeight:90, totalReps:8, sets:4 },
  { id:'p6', date: new Date(Date.now() - 2*864e5).toISOString(), exerciseName:'Pull-Up', totalVolume:0, maxWeight:0, totalReps:8, sets:3 },
  { id:'p7', date: new Date(Date.now() - 1*864e5).toISOString(), exerciseName:'Hip Thrust', totalVolume:1920, maxWeight:80, totalReps:12, sets:3 },
  { id:'p8', date: new Date().toISOString(), exerciseName:'Barbell Bench Press', totalVolume:2560, maxWeight:85, totalReps:8, sets:4 },
];

const MOCK_RECORDS = {
  'Barbell Bench Press': { exerciseName:'Barbell Bench Press', weight:85, reps:8, date: new Date().toISOString() },
  'Barbell Deadlift': { exerciseName:'Barbell Deadlift', weight:120, reps:5, date: new Date(Date.now()-5*864e5).toISOString() },
  'Barbell Squat': { exerciseName:'Barbell Squat', weight:90, reps:8, date: new Date(Date.now()-3*864e5).toISOString() },
  'Overhead Press': { exerciseName:'Overhead Press', weight:50, reps:8, date: new Date(Date.now()-4*864e5).toISOString() },
  'Hip Thrust': { exerciseName:'Hip Thrust', weight:80, reps:12, date: new Date(Date.now()-2*864e5).toISOString() },
};

const MOCK_CHAT = [
  { id:'m1', role:'user', content:'What should I eat before a workout?', timestamp: new Date(Date.now()-300000).toISOString() },
  { id:'m2', role:'assistant', content:'Great question! Here\'s what works best:\n\n- **30–60 min before:** A mix of carbs and protein — e.g. banana with peanut butter, or oats with whey protein\n- **Carbs** fuel your session, **protein** protects muscle\n- Avoid heavy fats or fiber right before — they slow digestion\n\nFor your muscle-gain goal, aim for ~30g carbs + 20g protein pre-workout. Stay hydrated too! 💪', timestamp: new Date(Date.now()-240000).toISOString() },
  { id:'m3', role:'user', content:'Can you add face pulls to my shoulder day?', timestamp: new Date(Date.now()-120000).toISOString() },
  { id:'m4', role:'assistant', content:'Absolutely! Face pulls are excellent for rear deltoid health and shoulder stability — a must for anyone pressing heavy.\n\nI\'ve added **Face Pull** (3 sets × 15 reps @ 20kg) to your Thursday Shoulders & Arms session. This will help balance out all that pressing work. ✅ I\'ve updated your workout plan based on your request!', timestamp: new Date(Date.now()-60000).toISOString(), isPlanUpdate: true },
];

async function screenshot() {
  await mkdir('public/screenshots', { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro

  // ── 1. Onboarding ──────────────────────────────────────────────────────────
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'public/screenshots/01-onboarding.png' });
  console.log('✓ Onboarding');

  // ── 2. Onboarding step 2 — goal selection ──────────────────────────────────
  await page.fill('input[placeholder="Your name"]', 'Alex');
  await page.fill('input[placeholder="25"]', '27');
  await page.fill('input[placeholder="175"]', '178');
  await page.fill('input[placeholder="70"]', '75');
  await page.click('button:has-text("Continue →")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'public/screenshots/02-goal-selection.png' });
  console.log('✓ Goal selection');

  // ── Inject mock data and reload into dashboard ─────────────────────────────
  await page.goto(URL);
  await page.evaluate(({ profile, plan, progress, records, chat }) => {
    localStorage.setItem('gymbudy:profile', JSON.stringify(profile));
    localStorage.setItem('gymbudy:plan', JSON.stringify(plan));
    localStorage.setItem('gymbudy:progress', JSON.stringify(progress));
    localStorage.setItem('gymbudy:records', JSON.stringify(records));
    localStorage.setItem('gymbudy:chat', JSON.stringify(chat));
  }, { profile: MOCK_PROFILE, plan: MOCK_PLAN, progress: MOCK_PROGRESS, records: MOCK_RECORDS, chat: MOCK_CHAT });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  // ── 3. Weekly Plan ─────────────────────────────────────────────────────────
  await page.screenshot({ path: 'public/screenshots/03-weekly-plan.png' });
  console.log('✓ Weekly plan');

  // ── 4. Workout Tracker ─────────────────────────────────────────────────────
  await page.click('button:has-text("Workout")');
  await page.waitForTimeout(400);
  // Expand first exercise
  await page.locator('.rounded-2xl button').first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'public/screenshots/04-workout-tracker.png' });
  console.log('✓ Workout tracker');

  // ── 5. Progress Dashboard ──────────────────────────────────────────────────
  await page.click('button:has-text("Progress")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'public/screenshots/05-progress.png' });
  console.log('✓ Progress');

  // ── 6. AI Coach Chat ───────────────────────────────────────────────────────
  await page.click('button:has-text("AI Coach")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'public/screenshots/06-ai-coach.png' });
  console.log('✓ AI coach');

  await browser.close();
  console.log('\n📸 All screenshots saved to public/screenshots/');
}

screenshot().catch(err => { console.error(err); process.exit(1); });
