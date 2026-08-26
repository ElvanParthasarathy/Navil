import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Nirvaagi from './பக்கங்கள்/கையாளுநர்';
import { ThemeProvider, CssBaseline } from '@mui/material';
import nirvaagiTheme from './கருப்பொருள்/கையாளுநர்கருப்பொருள்';
import './வடிவமைப்பு/கையாளுநர்விதானம்.css'; // M3 Expressive Tailwind tokens

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
