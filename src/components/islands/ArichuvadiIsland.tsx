import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { IslandProviders } from './IslandProviders';
import ArichuvadiTool from '../../சிறப்புக்கூறுகள்/கருவிகள்/அரிச்சுவடி/அரிச்சுவடிகருவி';

interface ArichuvadiIslandProps {
  feature?: string;
}

export default function ArichuvadiIsland({ feature }: ArichuvadiIslandProps) {
  const initialPath = feature ? `/tools/arichuvadi/${feature}` : '/tools/arichuvadi';
  return (
    <IslandProviders initialEntries={[initialPath]}>
      <Routes>
        <Route path="/tools/arichuvadi" element={<ArichuvadiTool />} />
        <Route path="/tools/arichuvadi/:feature" element={<ArichuvadiTool />} />
      </Routes>
    </IslandProviders>
  );
}
