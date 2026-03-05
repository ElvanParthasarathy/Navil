import React from 'react';
import WritingPage from '../../components/WritingPage';
import legacyQuotesData from '../../data/quotes.json';

const Quotes = () => (
    <WritingPage
        pageTitle="Quotes"
        pageTitleTamil="பொன்மொழிகள்"
        pageSubtitle="Short reflections and distilled thoughts."
        tableName="quotes"
        legacyData={legacyQuotesData}
    />
);

export default Quotes;
