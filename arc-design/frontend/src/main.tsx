import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import AppLayout from './components/layout/AppLayout';
import ProjectLayout from './components/layout/ProjectLayout';
import Dashboard from './pages/Dashboard';
import RoomDetail from './pages/project/RoomDetail';
import RoomIndex from './pages/project/RoomIndex';
import Schedule from './pages/project/Schedule';
import Systems from './pages/project/Systems';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/projects" element={<Dashboard />} />
            <Route path="/projects/:projectId" element={<ProjectLayout />}>
              <Route path="rooms" element={<RoomIndex />} />
              <Route path="rooms/:roomId" element={<RoomDetail />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="systems" element={<Systems />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
