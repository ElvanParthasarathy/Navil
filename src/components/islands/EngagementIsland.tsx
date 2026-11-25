import React from 'react';
import { IslandProviders } from './IslandProviders';
import { Engagement } from '../../கூறுகள்/தொடர்பு/தொடர்புகூறு';

interface EngagementIslandProps {
  postId: string;
  category: string;
}

export default function EngagementIsland({ postId, category }: EngagementIslandProps) {
  return (
    <IslandProviders>
      <Engagement postId={postId} category={category} />
    </IslandProviders>
  );
}
