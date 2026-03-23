import React from 'react';
import AppRouter from './router';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="bg-dark min-h-screen text-white font-sans selection:bg-primary/30">
          <AppRouter />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
