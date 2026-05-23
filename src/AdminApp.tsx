import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Admin from './pages/Admin';
import { ThemeProvider, CssBaseline } from '@mui/material';
import adminTheme from './theme/adminTheme';
import './styles/admin-tailwind.css'; // M3 Expressive Tailwind tokens

function AdminApp() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <BrowserRouter basename="/admin">
          <Routes>
            <Route path="/*" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default AdminApp;
