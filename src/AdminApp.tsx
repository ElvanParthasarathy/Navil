import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Admin from './pages/Admin';
import './index.css';
import './styles/admin.css';

function AdminApp() {
  return (
    <HelmetProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/*" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default AdminApp;
