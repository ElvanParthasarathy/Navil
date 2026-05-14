// @ts-nocheck
import React from 'react';
import WritingPage from '../../components/WritingPage';
import legacyPoemsData from '../../data/poems.json';

const Poems = () => (
    <WritingPage
        pageTitle="Poems"
        pageTitleTamil="செய்யுள்கள்"
        pageSubtitle="என் உணர்வுகளைப் பேசும் ஓசைநயமிக்க வரிகள்."
        pageSubtitleEnglish="My lyrical verses and emotional expressions."
        tableName="poems"
        legacyData={legacyPoemsData}
    />
);

export default Poems;

