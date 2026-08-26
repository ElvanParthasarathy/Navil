import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './கட்டமைப்பு';
import GlobalErrorBoundary from '../கூறுகள்/பின்னூட்டம்/பிழை_தடுப்பு';

// Feature page imports
import Home from '../சிறப்புக் கூறுகள்/முகப்பு/முகப்பு_பக்கம்';
import About from '../சிறப்புக் கூறுகள்/பற்றி/பற்றி_பக்கம்';
import Portfolio from '../சிறப்புக் கூறுகள்/பற்றி/தொகுப்பு';
import Settings from '../சிறப்புக் கூறுகள்/பற்றி/அமைப்புகள்_பக்கம்';
import Writings from '../சிறப்புக் கூறுகள்/படைப்புகள்/படைப்புகள்_பக்கம்';
import Teaching from '../சிறப்புக் கூறுகள்/பயிற்றுவிப்பு/பயிற்றுவிப்பு_பக்கம்';
import Arts from '../சிறப்புக் கூறுகள்/கலைகள்/கலைகள்_பக்கம்';
import ArtsGallery from '../சிறப்புக் கூறுகள்/கலைகள்/கலைக்கூடம்';
import ToolsView from '../சிறப்புக் கூறுகள்/கருவிகள்/கருவிகள்_பக்கம்';
import PianoTool from '../சிறப்புக் கூறுகள்/கருவிகள்/கின்னரப்பெட்டி/கின்னரப்பெட்டி_கருவி';
import TransliteratorTool from '../சிறப்புக் கூறுகள்/கருவிகள்/மொழிமாற்றி/மொழிமாற்றி_கருவி';
import ArichuvadiTool from '../சிறப்புக் கூறுகள்/கருவிகள்/அரிச்சுவடி/அரிச்சுவடி_கருவி';
import VocoderView from '../சிறப்புக் கூறுகள்/கருவிகள்/குரல்மாற்றி/குரல்மாற்றி_பார்வை';
import CategoryListView from '../சிறப்புக் கூறுகள்/படைப்புகள்/பார்வைகள்/வகை_பட்டியல்';
import StoriesListView from '../சிறப்புக் கூறுகள்/படைப்புகள்/பார்வைகள்/கதைகள்_பட்டியல்';
import ReadingView from '../சிறப்புக் கூறுகள்/படைப்புகள்/பார்வைகள்/வாசிப்பு_பார்வை';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <GlobalErrorBoundary />,
        children: [
            { index: true, element: <Home /> },
            { path: "about", element: <About /> },
            { path: "portfolio", element: <Portfolio /> },
            { path: "settings", element: <Settings /> },
            { path: "writings", element: <Writings /> },
            { path: "teaching", element: <Teaching /> },
            { path: "arts", element: <Arts /> },
            { path: "tools", element: <ToolsView /> },
            { path: "tools/piano", element: <PianoTool /> },
            { path: "tools/transliterator", element: <TransliteratorTool /> },
            { path: "tools/arichuvadi", element: <ArichuvadiTool /> },
            { path: "arts/:category", element: <ArtsGallery /> },
            { path: "teaching/vocoder", element: <VocoderView /> },

            // Unified Categories (Blog, Articles, Essays, Stories, Thoughts, Diary, Poems, Quotes)
            { path: "writings/stories", element: <StoriesListView /> },
            { path: "writings/stories/series/:seriesId", element: <StoriesListView /> },
            { path: "writings/:category", element: <CategoryListView /> },
            { path: "writings/:category/series/:seriesId", element: <CategoryListView /> },
            { path: "writings/:category/:slug", element: <ReadingView /> },
        ]
    }
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    },
});
