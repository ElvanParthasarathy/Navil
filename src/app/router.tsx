import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import GlobalErrorBoundary from '../components/core/GlobalErrorBoundary';

// Page imports
import Home from '../pages/main/Home';
import About from '../pages/main/About';
import Portfolio from '../pages/main/Portfolio';
import Settings from '../pages/main/Settings';
import Writings from '../pages/Writings';
import Teaching from '../pages/main/Teaching';
import Arts from '../pages/main/Arts';
import ArtsGallery from '../pages/main/ArtsGallery';
import ToolsView from '../pages/main/ToolsView';
import PianoTool from '../pages/tools/piano/PianoTool';
import TransliteratorTool from '../pages/tools/transliterator/TransliteratorTool';
import ArichuvadiTool from '../pages/tools/arichuvadi/ArichuvadiTool';
import VocoderView from '../pages/tools/VocoderView';
import CategoryListView from '../components/features/CategoryListView';
import StoriesListView from '../components/features/StoriesListView';
import ReadingView from '../components/features/ReadingView';

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
