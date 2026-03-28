import { useState } from 'react';
import type { UserProfile, FitnessGoal, ExperienceLevel, Equipment } from '../../types';
import { GOAL_META } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateWeeklyPlan } from '../../services/planGenerator';

type Step = 1 | 2 | 3;

const EQUIPMENT_OPTIONS: { value: Equipment; label: string; emoji: string }[] = [
  { value: 'barbell', label: 'Barbell', emoji: '🏋️' },
  { value: 'dumbbells', label: 'Dumbbells', emoji: '💪' },
  { value: 'machines', label: 'Machines', emoji: '⚙️' },
  { value: 'resistance-bands', label: 'Resistance Bands', emoji: '🪢' },
  { value: 'bodyweight', label: 'Bodyweight Only', emoji: '🤸' },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Less than 1 year of training' },
  { value: 'intermediate', label: 'Intermediate', description: '1–3 years of consistent training' },
  { value: 'advanced', label: 'Advanced', description: '3+ years of serious training' },
];

export default function OnboardingFlow() {
  const { setProfile, setPlan } = useApp();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<FitnessGoal | ''>('');
  const [experience, setExperience] = useState<ExperienceLevel | ''>('');
  const [equipment, setEquipment] = useState<Equipment[]>(['dumbbells', 'barbell']);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(4);

  function toggleEquipment(e: Equipment) {
    setEquipment(prev =>
      prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
    );
  }

  async function handleFinish() {
    if (!goal || !experience || equipment.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const profile: UserProfile = {
        id: `user-${Date.now()}`,
        name,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        goal: goal as FitnessGoal,
        experience: experience as ExperienceLevel,
        equipment,
        workoutsPerWeek,
        createdAt: new Date().toISOString(),
      };
      const plan = await generateWeeklyPlan(profile);
      setProfile(profile);
      setPlan(plan);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error: ${msg}`);
      setLoading(false);
    }
  }

  const canStep1 = name.trim() && Number(age) > 0 && Number(height) > 0 && Number(weight) > 0;
  const canStep2 = !!goal;
  const canFinish = !!experience && equipment.length > 0;

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 py-12">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-700/15 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-800/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-700/08 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <span className="text-2xl">🏋️</span>
            <span className="text-white/70 text-sm font-medium">Gym Buddy AI</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {step === 1 && "Let's get started"}
            {step === 2 && 'Choose your goal'}
            {step === 3 && 'Your setup'}
          </h1>
          <p className="text-white/50 text-sm">
            {step === 1 && 'Tell us about yourself for a personalized plan'}
            {step === 2 && 'What are you training for?'}
            {step === 3 && 'Experience level and equipment'}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-amber-400' : s < step ? 'w-4 bg-amber-600/50' : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="glass p-6 shadow-2xl shadow-black/50 animate-slide-up">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Name</label>
                <input
                  className="input-glass"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Age</label>
                  <input
                    className="input-glass"
                    type="number"
                    placeholder="25"
                    min="13" max="100"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Height (cm)</label>
                  <input
                    className="input-glass"
                    type="number"
                    placeholder="175"
                    min="100" max="250"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Weight (kg)</label>
                  <input
                    className="input-glass"
                    type="number"
                    placeholder="70"
                    min="30" max="300"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn-primary w-full mt-2"
                onClick={() => setStep(2)}
                disabled={!canStep1}
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Goal selection */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(GOAL_META) as [FitnessGoal, typeof GOAL_META[FitnessGoal]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setGoal(key)}
                    className={`relative p-4 rounded-2xl text-left transition-all duration-200 border ${
                      goal === key
                        ? 'border-amber-500/50 bg-white/10 scale-[1.02]'
                        : 'border-white/10 bg-white/[0.05] hover:bg-white/10'
                    }`}
                  >
                    {goal === key && (
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meta.gradient} opacity-20`} />
                    )}
                    <div className="relative">
                      <div className="text-2xl mb-1">{meta.emoji}</div>
                      <div className="text-white font-semibold text-sm">{meta.label}</div>
                      <div className="text-white/40 text-xs mt-0.5 leading-tight">{meta.description}</div>
                    </div>
                    {goal === key && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <button className="btn-glass flex-1" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary flex-1" onClick={() => setStep(3)} disabled={!canStep2}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Experience + Equipment */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Experience */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Experience Level</label>
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setExperience(opt.value)}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
                        experience === opt.value
                          ? 'border-amber-500/50 bg-amber-600/20'
                          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium text-sm">{opt.label}</div>
                          <div className="text-white/40 text-xs">{opt.description}</div>
                        </div>
                        {experience === opt.value && (
                          <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Equipment Available</label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggleEquipment(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        equipment.includes(opt.value)
                          ? 'border-amber-500/50 bg-amber-600/20 text-white'
                          : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workouts per week */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                  Workouts per Week: <span className="text-amber-400 font-bold">{workoutsPerWeek}</span>
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => setWorkoutsPerWeek(n)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        workoutsPerWeek === n
                          ? 'border-amber-500/50 bg-amber-600/20 text-amber-300'
                          : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button className="btn-glass flex-1" onClick={() => setStep(2)} disabled={loading}>← Back</button>
                <button
                  className="btn-primary flex-1 relative"
                  onClick={handleFinish}
                  disabled={!canFinish || loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating Plan…
                    </span>
                  ) : (
                    '✨ Create My Plan'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6">
          Your data is stored locally on your device.
        </p>
      </div>
    </div>
  );
}
