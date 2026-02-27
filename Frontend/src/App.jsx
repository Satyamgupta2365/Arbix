import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CoinsPage from './pages/CoinsPage';
import AgentPage from './pages/AgentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ContractsPage from './pages/ContractsPage';
import HistoryPage from './pages/HistoryPage';
import NotificationToast from './components/NotificationToast';

function App() {
    return (
        <Router>
            <NotificationToast />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/coins" element={<CoinsPage />} />
                <Route path="/agent" element={<AgentPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/contracts" element={<ContractsPage />} />
                <Route path="/history" element={<HistoryPage />} />
            </Routes>
        </Router>
    );
}

export default App;
