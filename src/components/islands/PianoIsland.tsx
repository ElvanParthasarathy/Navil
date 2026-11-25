import React from 'react';
import { IslandProviders } from './IslandProviders';
import PianoTool from '../../சிறப்புக்கூறுகள்/கருவிகள்/கின்னரப்பெட்டி/கின்னரப்பெட்டிகருவி';

export default function PianoIsland() {
  return (
    <IslandProviders initialEntries={['/tools/piano']}>
      <PianoTool />
    </IslandProviders>
  );
}
