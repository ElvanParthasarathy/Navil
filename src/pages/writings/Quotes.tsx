// @ts-nocheck
import React from 'react';
import WritingPage from '../../components/WritingPage';
import legacyQuotesData from '../../data/quotes.json';

const Quotes = () => (
    <WritingPage
        pageTitle="Quotes"
        pageTitleTamil="பொன்மொழிகள்"
        pageSubtitle="என் பட்டறிவில் உதித்த சிந்தனைத் துளிகள்."
        pageSubtitleEnglish="My short quotes and personal insights."
        tableName="quotes"
        legacyData={legacyQuotesData}
    />
);

export default Quotes;

