import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import SessionHistory from './components/pages/SessionHistory';
import PricingPage from './components/pricing/PricingPage';
import SessionDetails from './components/SessionDetails';
import SettingsPage from './components/pages/SettingsPage/SettingsPage';
import StudyPage from './components/pages/StudyPage/StudyPage';
import SuccessPage from './components/success/SuccessPage';
import { processApiKeyFromUrl, useApiKeyFromUrl, useVersionControl } from './hooks';
import { cleanupCorruptedEntries } from './core/services/storage/localStorage';
import LoadingScreen from './components/LoadingScreen';

// Clean up any corrupted localStorage entries first
cleanupCorruptedEntries();

// Process API key from URL immediately before any React rendering
// This ensures the API key is preserved during version migrations
processApiKeyFromUrl();

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
          <Route path="/study" element={<StudyPage />} />
          <Route path="/history" element={<SessionHistory />} />
          <Route path="/session/:id" element={<SessionDetails />} />
          <Route path="/settings" element={<SettingsPage />} />
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
