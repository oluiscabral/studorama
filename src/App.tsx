import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudySession from './components/StudySession';
import SessionHistory from './components/SessionHistory';
import SessionDetails from './components/SessionDetails';
import Settings from './components/Settings';
import PricingPage from './components/pricing/PricingPage';
import SuccessPage from './components/success/SuccessPage';
import AccountPage from './components/account/AccountPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study" element={<StudySession />} />
          <Route path="/history" element={<SessionHistory />} />
          <Route path="/session/:id" element={<SessionDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;