import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import GlobalErrorBoundary from '../components/core/GlobalErrorBoundary';

// Feature page imports
import Home from '../features/home/HomePage';
import About from '../features/about/AboutPage';
import Portfolio from '../features/about/Portfolio';
import Settings from '../features/about/Settings';
import Writings from '../features/writings/WritingsPage';
import Teaching from '../features/teaching/TeachingPage';
import Arts from '../features/arts/ArtsPage';
import ArtsGallery from '../features/arts/ArtsGallery';
import ToolsView from '../features/tools/ToolsPage';
import PianoTool from '../features/tools/piano/PianoTool';
import TransliteratorTool from '../features/tools/transliterator/TransliteratorTool';
import ArichuvadiTool from '../features/tools/arichuvadi/ArichuvadiTool';
import VocoderView from '../features/tools/vocoder/VocoderView';
import CategoryListView from '../features/writings/views/CategoryListView';
import StoriesListView from '../features/writings/views/StoriesListView';
import ReadingView from '../features/writings/views/ReadingView';

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
