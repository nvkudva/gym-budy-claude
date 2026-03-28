import { useApp } from './context/AppContext';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AppLayout from './components/layout/AppLayout';
import WeeklyPlanView from './components/plan/WeeklyPlanView';
import WorkoutTracker from './components/tracker/WorkoutTracker';
import ProgressDashboard from './components/progress/ProgressDashboard';
import ChatBot from './components/chat/ChatBot';

function Dashboard() {
  const { activeTab } = useApp();

  return (
    <AppLayout>
      <div className="h-full">
        {activeTab === 'plan' && <WeeklyPlanView />}
        {activeTab === 'workout' && <WorkoutTracker />}
        {activeTab === 'progress' && <ProgressDashboard />}
        {activeTab === 'chat' && <ChatBot />}
      </div>
    </AppLayout>
  );
}

export default function App() {
  const { profile } = useApp();
  return profile ? <Dashboard /> : <OnboardingFlow />;
}
