import { useApp } from './context/AppContext';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AppLayout from './components/layout/AppLayout';
import WeeklyPlanView from './components/plan/WeeklyPlanView';
import WorkoutTracker from './components/tracker/WorkoutTracker';
import ProgressDashboard from './components/progress/ProgressDashboard';
import ChatBot from './components/chat/ChatBot';
import SettingsView from './components/settings/SettingsView';

function Dashboard() {
  const { activeTab } = useApp();

  return (
    <AppLayout>
      <div className="h-full">
        {activeTab === 'plan' && <WeeklyPlanView />}
        {activeTab === 'workout' && <WorkoutTracker />}
        {activeTab === 'progress' && <ProgressDashboard />}
        {activeTab === 'chat' && <ChatBot />}
        {activeTab === 'settings' && <SettingsView />}
      </div>
    </AppLayout>
  );
}

export default function App() {
  const { profile, isAddingProfile } = useApp();
  return profile && !isAddingProfile ? <Dashboard /> : <OnboardingFlow />;
}
