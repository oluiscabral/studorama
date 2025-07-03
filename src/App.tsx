import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/pages/Dashboard';
import SessionHistory from './components/pages/SessionHistory';
import PricingPage from './components/pricing/PricingPage';
import SessionDetails from './components/SessionDetails';
import Settings from './components/Settings';
import StudySessionPage from './components/StudySession';
import SuccessPage from './components/success/SuccessPage';
import { useApiKeyFromUrl, useVersionControl } from './hooks';

function App() {
  // Initialize version control first
  const { isReady } = useVersionControl();
  
  // Initialize API key from URL if present (after version control)
  useApiKeyFromUrl();

  // Show loading screen while version control is initializing
  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study" element={<StudySessionPage />} />
          <Route path="/history" element={<SessionHistory />} />
          <Route path="/session/:id" element={<SessionDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;