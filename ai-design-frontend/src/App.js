import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientFormPage from './components/ClientFormPage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Client-facing form page */}
        <Route path="/" element={<ClientFormPage />} />
        <Route path="/client" element={<ClientFormPage />} />
        
        {/* Admin dashboard page */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Redirect any unknown routes to client page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;