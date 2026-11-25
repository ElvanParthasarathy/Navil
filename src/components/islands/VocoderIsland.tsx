import React from 'react';
import { IslandProviders } from './IslandProviders';
import VocoderView from '../../சிறப்புக்கூறுகள்/கருவிகள்/குரல்மாற்றி/குரல்மாற்றிபார்வை';

export default function VocoderIsland() {
  return (
    <IslandProviders initialEntries={['/tools/vocoder']}>
      <VocoderView />
    </IslandProviders>
  );
}
