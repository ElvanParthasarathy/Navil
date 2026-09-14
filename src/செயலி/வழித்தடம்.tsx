import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './கட்டமைப்பு';
import GlobalErrorBoundary from '../கூறுகள்/பின்னூட்டம்/பிழைதடுப்பு';

// Feature page imports
import CompanyHome from '../சிறப்புக்கூறுகள்/முகப்பு/நிறுவனமுகப்பு';
import Home from '../சிறப்புக்கூறுகள்/முகப்பு/முகப்புபக்கம்';
import About from '../சிறப்புக்கூறுகள்/பற்றி/பற்றிபக்கம்';
import Portfolio from '../சிறப்புக்கூறுகள்/பற்றி/தொகுப்பு';
import Settings from '../சிறப்புக்கூறுகள்/பற்றி/அமைப்புகள்பக்கம்';
import Writings from '../சிறப்புக்கூறுகள்/படைப்புகள்/படைப்புகள்பக்கம்';
import Teaching from '../சிறப்புக்கூறுகள்/பயிற்றுவிப்பு/பயிற்றுவிப்புபக்கம்';
import Arts from '../சிறப்புக்கூறுகள்/கலைகள்/கலைகள்பக்கம்';
import ArtsGallery from '../சிறப்புக்கூறுகள்/கலைகள்/கலைக்கூடம்';
import ToolsView from '../சிறப்புக்கூறுகள்/கருவிகள்/கருவிகள்பக்கம்';
import PianoTool from '../சிறப்புக்கூறுகள்/கருவிகள்/கின்னரப்பெட்டி/கின்னரப்பெட்டிகருவி';
import TransliteratorTool from '../சிறப்புக்கூறுகள்/கருவிகள்/மொழிமாற்றி/மொழிமாற்றிகருவி';
import ArichuvadiTool from '../சிறப்புக்கூறுகள்/கருவிகள்/அரிச்சுவடி/அரிச்சுவடிகருவி';
import VocoderView from '../சிறப்புக்கூறுகள்/கருவிகள்/குரல்மாற்றி/குரல்மாற்றிபார்வை';
import CategoryListView from '../சிறப்புக்கூறுகள்/படைப்புகள்/பார்வைகள்/வகைபட்டியல்';
import StoriesListView from '../சிறப்புக்கூறுகள்/படைப்புகள்/பார்வைகள்/கதைகள்பட்டியல்';
import ReadingView from '../சிறப்புக்கூறுகள்/படைப்புகள்/பார்வைகள்/வாசிப்புபார்வை';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <GlobalErrorBoundary />,
        children: [
            { index: true, element: <CompanyHome /> },
            { path: "navilgal", element: <Home /> },
            { path: "about", element: <About /> },
            { path: "portfolio", element: <Portfolio /> },
            { path: "settings", element: <Settings /> },
            { path: "writings", element: <Writings /> },
            { path: "teaching", element: <Teaching /> },
            { path: "tools/teaching", element: <Teaching /> },
            { path: "arts", element: <Arts /> },
            { path: "tools", element: <ToolsView /> },
            { path: "tools/piano", element: <PianoTool /> },
            { path: "tools/transliterator", element: <TransliteratorTool /> },
            { path: "tools/arichuvadi", element: <ArichuvadiTool /> },
            { path: "tools/vocoder", element: <VocoderView /> },
            { path: "arts/:category", element: <ArtsGallery /> },
            { path: "teaching/vocoder", element: <VocoderView /> },

            // Navilgal Literary Archive - ezhutgal / ezhuthugal / writings
            { path: "navilgal/ezhutgal", element: <Writings /> },
            { path: "navilgal/ezhutgal/stories", element: <StoriesListView /> },
            { path: "navilgal/ezhutgal/stories/series/:seriesId", element: <StoriesListView /> },
            { path: "navilgal/ezhutgal/:category", element: <CategoryListView /> },
            { path: "navilgal/ezhutgal/:category/series/:seriesId", element: <CategoryListView /> },
            { path: "navilgal/ezhutgal/:category/:slug", element: <ReadingView /> },

            { path: "navilgal/ezhuthugal", element: <Writings /> },
            { path: "navilgal/ezhuthugal/stories", element: <StoriesListView /> },
            { path: "navilgal/ezhuthugal/stories/series/:seriesId", element: <StoriesListView /> },
            { path: "navilgal/ezhuthugal/:category", element: <CategoryListView /> },
            { path: "navilgal/ezhuthugal/:category/series/:seriesId", element: <CategoryListView /> },
            { path: "navilgal/ezhuthugal/:category/:slug", element: <ReadingView /> },

            { path: "navilgal/writings", element: <Writings /> },
            { path: "navilgal/writings/stories", element: <StoriesListView /> },
            { path: "navilgal/writings/stories/series/:seriesId", element: <StoriesListView /> },
            { path: "navilgal/writings/:category", element: <CategoryListView /> },
            { path: "navilgal/writings/:category/series/:seriesId", element: <CategoryListView /> },
            { path: "navilgal/writings/:category/:slug", element: <ReadingView /> },

            // Navilgal Arts Gallery - padaippugal / arts
            { path: "navilgal/padaippugal", element: <Arts /> },
            { path: "navilgal/padaippugal/:category", element: <ArtsGallery /> },
            { path: "navilgal/arts", element: <Arts /> },
            { path: "navilgal/arts/:category", element: <ArtsGallery /> },

            // Unified Categories (Legacy direct paths)
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
