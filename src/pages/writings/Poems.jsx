import React from 'react';
import WritingPage from '../../components/WritingPage';
import legacyPoemsData from '../../data/poems.json';

const Poems = () => (
    <WritingPage
        pageTitle="Poems"
        pageTitleTamil="செய்யுள்கள்"
        pageSubtitle="Verses, rhythms, and lyrical expressions."
        tableName="poems"
        legacyData={legacyPoemsData}
    />
);

export default Poems;
