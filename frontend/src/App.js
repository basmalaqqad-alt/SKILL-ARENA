import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import MainDashboard from './components/layout/MainDashboard';

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LoginForm
            onLogin={() => navigate('/dashboard/about')}
            onSwitch={() => navigate('/signup')}
          />
        }
      />
      <Route
        path="/signup"
        element={<SignupForm onSwitch={() => navigate('/')} />}
      />
      <Route path="/dashboard/*" element={<MainDashboard />} />
    </Routes>
  );
}

export default App; // ضروري جداً لتصدير الملف
