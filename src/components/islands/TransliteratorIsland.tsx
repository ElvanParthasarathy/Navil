import React from 'react';
import { IslandProviders } from './IslandProviders';
import TransliteratorTool from '../../சிறப்புக்கூறுகள்/கருவிகள்/மொழிமாற்றி/மொழிமாற்றிகருவி';

export default function TransliteratorIsland() {
  return (
    <IslandProviders initialEntries={['/tools/transliterator']}>
      <TransliteratorTool />
    </IslandProviders>
  );
}
