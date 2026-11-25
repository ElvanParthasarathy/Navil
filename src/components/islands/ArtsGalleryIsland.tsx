import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { IslandProviders } from './IslandProviders';
import ArtsGallery from '../../சிறப்புக்கூறுகள்/கலைகள்/கலைக்கூடம்';

interface ArtsGalleryIslandProps {
  category: string;
}

export default function ArtsGalleryIsland({ category }: ArtsGalleryIslandProps) {
  return (
    <IslandProviders initialEntries={[`/arts/${category}`]}>
      <Routes>
        <Route path="/arts/:category" element={<ArtsGallery />} />
      </Routes>
    </IslandProviders>
  );
}
