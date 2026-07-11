# Elvan Navil

## Project Overview
Elvan Navil is a sophisticated, deeply bilingual digital portfolio, literary archive, and comprehensive content management ecosystem built to preserve and showcase the creative legacy of Elvan Parthasarathy. Far beyond a standard personal website, Elvan Navil serves as a dynamic "Digital Museum"—a highly interactive, scalable platform designed to chronicle poetry, literature, visual arts, and professional milestones with profound structural elegance. The foundational design philosophy centers on delivering a premium, distraction-free reading experience that is natively bilingual: Tamil and English are seamlessly intertwined everywhere throughout the interface and content. It equips the author with a robust, integrated administrative layer to curate and manage decades of work seamlessly in both languages.

## Key Features / Core Concepts
* **Deeply Bilingual Architecture:** Tamil and English coexist natively across every module, button, and reading view of the website. The UI and content are structurally built to support a bilingual audience flawlessly.
* **Digital Museum Architecture:** An immersive archiving interface specifically designed to catalog legacy data. It handles high-density content (stories, essays, thoughts, and quotes) with fluid, Instagram-inspired skeleton loading states and robust pagination to prevent performance degradation.
* **Unified Bilingual Typography System:** Engineered from the ground up to support high-fidelity bilingual rendering, seamlessly integrating a custom `ElvanSans` font stack to maintain impeccable vertical rhythms and readability across both Tamil and English texts without layout shift or line-height clipping.
* **The "Nirvaagi" Admin Ecosystem:** A comprehensive, hidden CMS built directly into the client architecture. "Nirvaagi" (Tamil for Administrator) empowers the author with rich-text editing (powered by Tiptap), database syncing, draft management, and comment moderation—bypassing the need for a separate third-party headless CMS.
* **Dynamic Content Routing Engine:** A highly optimized router implementation that groups scattered literary domains (Blogs, Articles, Poems, Diaries) into a single, seamless reading view, allowing for programmatic slug generation, category-based filtering, and real-time navigation sliding animations.

## Built-in Features / Modules
* **Archive & Instagram Replica ("My Account"):** A flawless, high-fidelity reconstruction of an Instagram profile page designed for cross-platform perfection. It features split-pane modal viewing on desktop and a highly optimized, swipeable, infinite-scrolling feed overlay for mobile users, preserving legacy social media posts exactly as they were.
* **Writings & Reading Views:** A deeply customized reading interface for long-form content, supporting nested chapters, series-linked posts, dynamic table of contents, and cross-referenced literary badges (e.g., 'Agam', 'Puram').
* **Arts & Visual Gallery:** A dedicated visual portfolio module to showcase creative design, complete with masonry layouts, categorized filtering, and high-performance image lazy-loading.
* **Vocoder Tool:** A specialized sub-application located within the Teaching section, demonstrating interactive client-side logic and standalone tool integration.
* **Global Engagement Module:** A unified commenting and "like" system integrated into the reading views, backed by real-time database syncing.
* **Profile & Settings:** A centralized hub for user preferences, including a robust Light/Dark mode theming engine and dynamic thumbnail toggles.

## Technical Stack
* **Core Framework:** React 18 / Vite 5
* **Routing:** React Router v7 (Data APIs and dynamic splat routing)
* **Styling Engine:** Tailwind CSS v4, supplemented with raw CSS modules and Material UI (for the Nirvaagi admin interface)
* **State & Data Management:** React Context API (Theme/Settings) paired with Firebase (Realtime Database & Authentication)
* **Animation & Interactions:** Framer Motion (page transitions and micro-interactions) and dnd-kit (drag-and-drop mechanics in the admin)
* **Rich Text Editing:** Tiptap Headless Editor (with custom extensions for resizing and responsive document formatting)

## Architecture and Code Structure
Navil adopts a hybrid architecture that blends a public-facing static-like application with a complex, authenticated single-page application (SPA). 

The primary entry point (`main.tsx`) bootstraps the React application and registers offline service workers, passing control to the dynamic router in `App.tsx`. The router handles layout transitions and intercepts navigation history to dictate forward/backward sliding animations. 

The public UI is completely decoupled from the data mutation layer. Content pages (e.g., `CategoryListView.tsx`, `ReadingView.tsx`) retrieve normalized data payloads from Firebase and pass them through reusable presentation components (`src/components/features`). 

The administrative layer acts almost as a shadow application. `NirvaagiApp.tsx` serves as the entry for the CMS, orchestrating authentication and rendering `Nirvaagi.tsx`. Inside the admin interface, domain-specific editors (`PoemEditor`, `StoryEditor`, `BlogEditor`) handle schema validation and dispatch updates directly to Firebase via the `lib/firebaseClient.ts` utility. The entire system is built to share interfaces (`SCHEMAS`, `SharedDatalists`) to ensure that data written by the admin panel is immediately consumable and perfectly formatted for the public reading views.

## Directory Layout
```text
src/
├── assets/             # Static media assets, branding files, and custom fonts
├── components/         # Reusable React components grouped by domain
│   ├── archive/        # Legacy data display components and skeleton loaders
│   ├── core/           # Foundational app components (GlobalErrorBoundary, Layouts)
│   ├── features/       # Complex domain-specific views (CategoryList, ReadingView, StoriesList)
│   ├── nirvaagi/       # The complete Admin CMS (Dashboards, Editors, Views)
│   ├── ui/             # Reusable primitive elements (Buttons, Badges, Modals, AdBanners)
│   └── vocoder/        # Components specific to the Vocoder teaching tool
├── data/               # Static fallback JSON files and localized app configuration
├── dev-tools/          # Internal utilities for development, debugging, or mock generation
├── legacy/             # Deprecated components and legacy architectural files retained for reference
├── lib/                # Third-party integrations, API clients, and core logic (Firebase, Engagement)
├── pages/              # Top-level route components mapped to the URL structure
│   ├── main/           # Core site pages (Home, About, Portfolio, Settings, Arts, Archive)
│   ├── tools/          # Standalone application routes (Vocoder)
│   └── writings/       # Specialized layout containers for the literary sections
├── styles/             # Global stylesheets and Tailwind configurations for specific modules
├── theme/              # Centralized token definitions for Light/Dark mode and color palettes
├── App.tsx             # Primary router definition, context providers, and layout orchestrator
├── main.tsx            # Public application entry point and DOM bootstrapper
├── NirvaagiApp.tsx     # Shadow entry point for the internal administrative CMS
└── index.css           # Global CSS resets, custom font-face declarations, and baseline variables
```
