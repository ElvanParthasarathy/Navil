import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Nirvaagi from './pages/Nirvaagi';
import { ThemeProvider, CssBaseline } from '@mui/material';
import nirvaagiTheme from './theme/nirvaagiTheme';
import './styles/nirvaagi-tailwind.css'; // M3 Expressive Tailwind tokens

function NirvaagiApp() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={nirvaagiTheme}>
        <CssBaseline />
        <BrowserRouter basename="/nirvaagi">
          <Routes>
            <Route path="/*" element={<Nirvaagi />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default NirvaagiApp;
