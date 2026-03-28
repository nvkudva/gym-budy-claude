import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, WeeklyPlan, ChatMessage, ProgressEntry, PersonalRecord } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'gymbudy:profile',
  PLAN: 'gymbudy:plan',
  CHAT: 'gymbudy:chat',
  PROGRESS: 'gymbudy:progress',
  RECORDS: 'gymbudy:records',
};

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

// ─── Context Types ────────────────────────────────────────────────────────────

interface AppContextValue {
  // Profile
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
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

  // Navigation
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;

  // Chat panel
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
}

export type Tab = 'plan' | 'workout' | 'progress' | 'chat';

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => load(STORAGE_KEYS.PROFILE));
  const [plan, setPlanState] = useState<WeeklyPlan | null>(() => load(STORAGE_KEYS.PLAN));
  const [messages, setMessages] = useState<ChatMessage[]>(() => load(STORAGE_KEYS.CHAT) ?? []);
  const [progressHistory, setProgress] = useState<ProgressEntry[]>(() => load(STORAGE_KEYS.PROGRESS) ?? []);
  const [records, setRecords] = useState<Record<string, PersonalRecord>>(() => load(STORAGE_KEYS.RECORDS) ?? {});
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  const [chatOpen, setChatOpen] = useState(false);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    save(STORAGE_KEYS.PROFILE, p);
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    setPlanState(null);
    setMessages([]);
    setProgress([]);
    setRecords({});
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }, []);

  const setPlan = useCallback((p: WeeklyPlan) => {
    setPlanState(p);
    save(STORAGE_KEYS.PLAN, p);
  }, []);

  const addMessage = useCallback((m: ChatMessage) => {
    setMessages(prev => {
      const next = [...prev, m];
      save(STORAGE_KEYS.CHAT, next);
      return next;
    });
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEYS.CHAT);
  }, []);

  const addProgress = useCallback((e: ProgressEntry) => {
    setProgress(prev => {
      const next = [...prev, e];
      save(STORAGE_KEYS.PROGRESS, next);
      return next;
    });
  }, []);

  const updateRecord = useCallback((exerciseName: string, r: PersonalRecord) => {
    setRecords(prev => {
      const current = prev[exerciseName];
      if (!current || r.weight > current.weight || (r.weight === current.weight && r.reps > current.reps)) {
        const next = { ...prev, [exerciseName]: r };
        save(STORAGE_KEYS.RECORDS, next);
        return next;
      }
      return prev;
    });
  }, []);

  // Sync plan updates to storage
  useEffect(() => {
    if (plan) save(STORAGE_KEYS.PLAN, plan);
  }, [plan]);

  const value: AppContextValue = {
    profile, setProfile, clearProfile,
    plan, setPlan,
    messages, addMessage, clearChat,
    progressHistory, addProgress,
    records, updateRecord,
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
