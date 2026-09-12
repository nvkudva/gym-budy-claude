import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GOAL_META } from '../../types';
import type { FitnessGoal } from '../../types';
import { loadAIConfig, saveAIConfig, FREE_MODELS } from '../../services/aiConfig';
import type { AIConfig, AIProvider } from '../../services/aiConfig';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-5 mb-4">
      <h2 className="text-white font-semibold text-sm mb-0.5">{title}</h2>
      {subtitle && <p className="text-white/35 text-[11px] mb-4">{subtitle}</p>}
      <div className={subtitle ? '' : 'mt-4'}>{children}</div>
    </section>
  );
}

const inputClass =
  'w-full bg-white/5 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:bg-white/10 transition';
const labelClass = 'block text-white/40 text-[11px] uppercase tracking-wide mb-1.5';

export default function SettingsView() {
  const {
    profile, profiles, updateProfile, switchProfile, deleteProfile,
    startNewProfile, theme, toggleTheme, setActiveTab,
  } = useApp();

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => loadAIConfig());
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const patchAI = (patch: Partial<AIConfig>) => {
    const next = { ...aiConfig, ...patch };
    setAiConfig(next);
    saveAIConfig(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-5 pb-nav">
      <h1 className="text-white text-2xl font-bold mb-1">Profile &amp; Settings</h1>
      <p className="text-white/35 text-xs mb-6">Tune your profile, appearance and AI provider</p>

      <Section title="Your Profile">
        <label className={labelClass}>Display Name</label>
        <input
          className={inputClass}
          value={profile.name}
          onChange={e => updateProfile({ name: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className={labelClass}>Age</label>
            <input type="number" className={inputClass} value={profile.age}
              onChange={e => updateProfile({ age: Number(e.target.value) })} />
          </div>
          <div>
            <label className={labelClass}>Height (cm)</label>
            <input type="number" className={inputClass} value={profile.height}
              onChange={e => updateProfile({ height: Number(e.target.value) })} />
          </div>
          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input type="number" className={inputClass} value={profile.weight}
              onChange={e => updateProfile({ weight: Number(e.target.value) })} />
          </div>
        </div>
      </Section>

      <Section title="Current Goal" subtitle="Regenerate your plan after changing this">
        <div className="space-y-2">
          {(Object.keys(GOAL_META) as FitnessGoal[]).map(goal => {
            const meta = GOAL_META[goal];
            const active = profile.goal === goal;
            return (
              <button
                key={goal}
                onClick={() => updateProfile({ goal })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition
                  ${active ? 'nav-pill-active' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}
              >
                <span className="text-lg">{meta.emoji}</span>
                <span className="flex-1">
                  <span className={`block text-sm ${active ? 'text-amber-400' : 'text-white'}`}>{meta.label}</span>
                  <span className="block text-white/30 text-[11px]">{meta.description}</span>
                </span>
                {active && <span className="text-amber-400 text-sm">✓</span>}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Appearance" subtitle="Adjust how the app looks">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition"
        >
          <span className="flex items-center gap-3">
            <span className="text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span className="text-white text-sm">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <span className={`w-11 h-6 rounded-full p-0.5 transition ${theme === 'dark' ? 'bg-white/15' : 'bg-amber-500'}`}>
            <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${theme === 'dark' ? '' : 'translate-x-5'}`} />
          </span>
        </button>
      </Section>

      <Section title="AI Provider" subtitle="Runs the plan generator and the AI coach">
        <div className="flex gap-2 mb-4">
          {(['openrouter', 'local'] as AIProvider[]).map(p => (
            <button
              key={p}
              onClick={() => patchAI({ provider: p })}
              className={`flex-1 py-2 rounded-xl text-sm transition
                ${aiConfig.provider === p ? 'nav-pill-active text-amber-400' : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06]'}`}
            >
              {p === 'openrouter' ? 'OpenRouter' : 'Local (Ollama)'}
            </button>
          ))}
        </div>

        {aiConfig.provider === 'openrouter' ? (
          <>
            <label className={labelClass}>API Key</label>
            <input
              type="password"
              placeholder="sk-or-v1-…"
              className={inputClass}
              value={aiConfig.openrouterApiKey}
              onChange={e => patchAI({ openrouterApiKey: e.target.value })}
            />
            <p className="text-white/25 text-[11px] mt-1.5">
              Stored only in this browser. Get a free key at openrouter.ai/keys
            </p>
            <label className={`${labelClass} mt-4`}>Model</label>
            <select
              className={inputClass}
              value={aiConfig.openrouterModel}
              onChange={e => patchAI({ openrouterModel: e.target.value })}
            >
              {FREE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </>
        ) : (
          <>
            <label className={labelClass}>Base URL</label>
            <input className={inputClass} value={aiConfig.localBaseUrl}
              onChange={e => patchAI({ localBaseUrl: e.target.value })} />
            <label className={`${labelClass} mt-4`}>Model</label>
            <input className={inputClass} value={aiConfig.localModel}
              onChange={e => patchAI({ localModel: e.target.value })} />
            <p className="text-white/25 text-[11px] mt-1.5">
              Any OpenAI-compatible server — Ollama, LM Studio, llama.cpp
            </p>
          </>
        )}
        {saved && <p className="text-amber-400 text-[11px] mt-3">Saved</p>}
      </Section>

      <Section title="Profiles" subtitle="Each profile keeps its own plan, history and records">
        <div className="space-y-2">
          {profiles.map(p => {
            const active = p.id === profile.id;
            return (
              <div key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${active ? 'nav-pill-active' : 'bg-white/[0.03]'}`}>
                <button className="flex-1 text-left" onClick={() => switchProfile(p.id)}>
                  <span className={`block text-sm ${active ? 'text-amber-400' : 'text-white'}`}>{p.name}</span>
                  <span className="block text-white/30 text-[11px]">
                    {GOAL_META[p.goal].label} · {p.workoutsPerWeek}×/week
                  </span>
                </button>
                {profiles.length > 1 && (
                  <button
                    onClick={() => { if (confirm(`Delete profile "${p.name}" and all its data?`)) deleteProfile(p.id); }}
                    className="text-white/25 hover:text-red-400 text-xs px-2 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={startNewProfile}
          className="w-full mt-3 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-white/60 text-sm transition"
        >
          + Add another profile
        </button>
      </Section>

      <Section title="Danger Zone" subtitle="This cannot be undone">
        <button
          onClick={() => {
            if (confirm('Delete this profile, its plan, history and records?')) {
              deleteProfile(profile.id);
              setActiveTab('plan');
            }
          }}
          className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition"
        >
          Delete "{profile.name}" and all its data
        </button>
      </Section>
    </div>
  );
}
