import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudySessionPage from './components/StudySession';
import SessionHistory from './components/SessionHistory';
import SessionDetails from './components/SessionDetails';
import Settings from './components/Settings';
import PricingPage from './components/pricing/PricingPage';
import SuccessPage from './components/success/SuccessPage';
import { useApiKeyFromUrl } from './hooks/useApiKeyFromUrl';
import { useVersionControl } from './hooks/useVersionControl';
import LoadingScreen from './components/LoadingScreen';

function App() {
  // Initialize version control first
  const { isReady, migrationPerformed, currentVersion } = useVersionControl();
  
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;