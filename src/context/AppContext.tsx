import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, WeeklyPlan, ChatMessage, ProgressEntry, PersonalRecord } from '../types';

const PROFILES_KEY = 'gymbudy:profiles';
const ACTIVE_KEY = 'gymbudy:activeProfileId';
const THEME_KEY = 'gymbudy:theme';

// Per-profile data lives under a namespaced key so profiles never bleed into
// each other: gymbudy:<profileId>:plan, :chat, :progress, :records.
const scoped = (id: string, slot: string) => `gymbudy:${id}:${slot}`;

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export type Theme = 'dark' | 'light';
export type Tab = 'plan' | 'workout' | 'progress' | 'chat' | 'settings';

interface AppContextValue {
  // Profiles
  profiles: UserProfile[];
  profile: UserProfile | null;
  activeProfileId: string | null;
  setProfile: (p: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  startNewProfile: () => void;
  seedProfile: (seed: {
    profile: UserProfile;
    plan: WeeklyPlan;
    progress?: ProgressEntry[];
    records?: Record<string, PersonalRecord>;
  }) => void;
  isAddingProfile: boolean;
  clearProfile: () => void;

  // Plan
  plan: WeeklyPlan | null;
  setPlan: (p: WeeklyPlan) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  clearChat: () => void;

  // Progress
  progressHistory: ProgressEntry[];
  addProgress: (e: ProgressEntry) => void;
  records: Record<string, PersonalRecord>;
  updateRecord: (exerciseName: string, r: PersonalRecord) => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;

  // Navigation
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/** One-time migration from the single-profile layout shipped before v2. */
function migrateLegacyProfile(): UserProfile[] {
  const legacy = load<UserProfile>('gymbudy:profile');
  if (!legacy) return [];
  const id = legacy.id || crypto.randomUUID();
  const migrated = { ...legacy, id };
  (['plan', 'chat', 'progress', 'records'] as const).forEach(slot => {
    const old = localStorage.getItem(`gymbudy:${slot}`);
    if (old) localStorage.setItem(scoped(id, slot), old);
  });
  save(PROFILES_KEY, [migrated]);
  save(ACTIVE_KEY, id);
  localStorage.removeItem('gymbudy:profile');
  return [migrated];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(
    () => load<UserProfile[]>(PROFILES_KEY) ?? migrateLegacyProfile(),
  );
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    const stored = load<string>(ACTIVE_KEY);
    const all = load<UserProfile[]>(PROFILES_KEY) ?? [];
    return stored && all.some(p => p.id === stored) ? stored : (all[0]?.id ?? null);
  });
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  const [plan, setPlanState] = useState<WeeklyPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [progressHistory, setProgress] = useState<ProgressEntry[]>([]);
  const [records, setRecords] = useState<Record<string, PersonalRecord>>({});

  const [theme, setTheme] = useState<Theme>(() => load<Theme>(THEME_KEY) ?? 'dark');
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  const [chatOpen, setChatOpen] = useState(false);

  const profile = profiles.find(p => p.id === activeProfileId) ?? null;

  // Load the active profile's scoped data whenever the profile changes.
  useEffect(() => {
    if (!activeProfileId) {
      setPlanState(null);
      setMessages([]);
      setProgress([]);
      setRecords({});
      return;
    }
    setPlanState(load<WeeklyPlan>(scoped(activeProfileId, 'plan')));
    setMessages(load<ChatMessage[]>(scoped(activeProfileId, 'chat')) ?? []);
    setProgress(load<ProgressEntry[]>(scoped(activeProfileId, 'progress')) ?? []);
    setRecords(load<Record<string, PersonalRecord>>(scoped(activeProfileId, 'records')) ?? {});
  }, [activeProfileId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    save(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);


  const setProfile = useCallback((p: UserProfile) => {
    setProfiles(prev => {
      const next = prev.some(x => x.id === p.id)
        ? prev.map(x => (x.id === p.id ? p : x))
        : [...prev, p];
      save(PROFILES_KEY, next);
      return next;
    });
    setActiveProfileId(p.id);
    save(ACTIVE_KEY, p.id);
    setIsAddingProfile(false);
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    if (!activeProfileId) return;
    setProfiles(prev => {
      const next = prev.map(p => (p.id === activeProfileId ? { ...p, ...patch } : p));
      save(PROFILES_KEY, next);
      return next;
    });
  }, [activeProfileId]);

  const switchProfile = useCallback((id: string) => {
    setActiveProfileId(id);
    save(ACTIVE_KEY, id);
    setIsAddingProfile(false);
    setActiveTab('plan');
  }, []);

  const deleteProfile = useCallback((id: string) => {
    (['plan', 'chat', 'progress', 'records'] as const)
      .forEach(slot => localStorage.removeItem(scoped(id, slot)));
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      save(PROFILES_KEY, next);
      if (id === activeProfileId) {
        const fallback = next[0]?.id ?? null;
        setActiveProfileId(fallback);
        if (fallback) save(ACTIVE_KEY, fallback);
        else localStorage.removeItem(ACTIVE_KEY);
        setActiveTab('plan');
      }
      return next;
    });
  }, [activeProfileId]);

  const startNewProfile = useCallback(() => setIsAddingProfile(true), []);

  /** Creates a profile and all of its scoped data in one shot. setProfile +
   *  setPlan cannot do this: setPlan would still see the previous
   *  activeProfileId from its closure and write the plan into the wrong scope. */
  const seedProfile = useCallback((seed: {
    profile: UserProfile;
    plan: WeeklyPlan;
    progress?: ProgressEntry[];
    records?: Record<string, PersonalRecord>;
  }) => {
    const { profile: p, plan: seedPlan, progress = [], records: seedRecords = {} } = seed;
    save(scoped(p.id, 'plan'), seedPlan);
    save(scoped(p.id, 'progress'), progress);
    save(scoped(p.id, 'records'), seedRecords);
    save(scoped(p.id, 'chat'), []);

    setProfiles(prev => {
      const next = prev.some(x => x.id === p.id) ? prev.map(x => (x.id === p.id ? p : x)) : [...prev, p];
      save(PROFILES_KEY, next);
      return next;
    });
    setActiveProfileId(p.id);
    save(ACTIVE_KEY, p.id);
    setIsAddingProfile(false);
  }, []);

  const clearProfile = useCallback(() => {
    if (activeProfileId) deleteProfile(activeProfileId);
  }, [activeProfileId, deleteProfile]);

  const setPlan = useCallback((p: WeeklyPlan) => {
    setPlanState(p);
    if (activeProfileId) save(scoped(activeProfileId, 'plan'), p);
  }, [activeProfileId]);

  const addMessage = useCallback((m: ChatMessage) => {
    setMessages(prev => {
      const next = [...prev, m];
      if (activeProfileId) save(scoped(activeProfileId, 'chat'), next);
      return next;
    });
  }, [activeProfileId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (activeProfileId) localStorage.removeItem(scoped(activeProfileId, 'chat'));
  }, [activeProfileId]);

  const addProgress = useCallback((e: ProgressEntry) => {
    setProgress(prev => {
      const next = [...prev, e];
      if (activeProfileId) save(scoped(activeProfileId, 'progress'), next);
      return next;
    });
  }, [activeProfileId]);

  const updateRecord = useCallback((exerciseName: string, r: PersonalRecord) => {
    setRecords(prev => {
      const current = prev[exerciseName];
      if (!current || r.weight > current.weight || (r.weight === current.weight && r.reps > current.reps)) {
        const next = { ...prev, [exerciseName]: r };
        if (activeProfileId) save(scoped(activeProfileId, 'records'), next);
        return next;
      }
      return prev;
    });
  }, [activeProfileId]);

  useEffect(() => {
    if (plan && activeProfileId) save(scoped(activeProfileId, 'plan'), plan);
  }, [plan, activeProfileId]);

  const value: AppContextValue = {
    profiles, profile, activeProfileId,
    setProfile, updateProfile, switchProfile, deleteProfile,
    startNewProfile, seedProfile, isAddingProfile, clearProfile,
    plan, setPlan,
    messages, addMessage, clearChat,
    progressHistory, addProgress,
    records, updateRecord,
    theme, toggleTheme,
    activeTab, setActiveTab,
    chatOpen, setChatOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

