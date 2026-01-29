import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/environments" element={<Dashboard />} /> {/* Placeholder reuse for now */}
          <Route path="/monitoring" element={<Dashboard />} />   {/* Placeholder reuse for now */}
          <Route path="/settings" element={<Dashboard />} />     {/* Placeholder reuse for now */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
