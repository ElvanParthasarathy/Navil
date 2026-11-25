export interface WritingCategoryCopy {
  title: string;
  desc: string;
  footer: string;
}

export interface ArtCategoryCopy {
  title: string;
  desc: string;
  footer: string;
  editorial: string;
}

export interface RouteLabelCopy {
  title: string;
}

export interface FeatureCopy {
  title: string;
  desc: string;
}

export interface UITranslations {
  brand: {
    name: string;
    studioTagline: string;
    navilWord: string;
    navilPos: string;
    navilDef: string;
  };
  nav: {
    home: string;
    navilgal: string;
    tools: string;
    downloads: string;
    about: string;
    profile: string;
    backAria: string;
    backTitle: string;
    collapseSidebar: string;
    expandSidebar: string;
  };
  settingsMenu: {
    appearanceLabel: string;
    scriptLabel: string;
    back: string;
    autoSystem: string;
    lightMode: string;
    darkMode: string;
    light: string;
    auto: string;
    dark: string;
    modeBilingual: string;
    modeTanglishEn: string;
    modeTanglish: string;
    settingsLink: string;
    aboutLink: string;
    privacyLink: string;
  };
  footer: {
    studioDesc: string;
    home: string;
    writings: string;
    arts: string;
    tools: string;
    nammil: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    disclaimer: string;
  };
  routes: {
    home: RouteLabelCopy;
    nammil: RouteLabelCopy;
    downloads: RouteLabelCopy;
    navilgal: RouteLabelCopy;
    writings: RouteLabelCopy;
    poems: RouteLabelCopy;
    quotes: RouteLabelCopy;
    stories: RouteLabelCopy;
    articles: RouteLabelCopy;
    diary: RouteLabelCopy;
    blog: RouteLabelCopy;
    arts: RouteLabelCopy;
    artsSketches: RouteLabelCopy;
    artsIllustrations: RouteLabelCopy;
    artsPosters: RouteLabelCopy;
    artsEditing: RouteLabelCopy;
    artsPainting: RouteLabelCopy;
    artsDigital: RouteLabelCopy;
    artsGallery: RouteLabelCopy;
    transliterator: RouteLabelCopy;
    arichuvadi: RouteLabelCopy;
    vocoder: RouteLabelCopy;
    piano: RouteLabelCopy;
    teaching: RouteLabelCopy;
    tools: RouteLabelCopy;
    about: RouteLabelCopy;
    contact: RouteLabelCopy;
    privacy: RouteLabelCopy;
    terms: RouteLabelCopy;
    disclaimer: RouteLabelCopy;
    portfolio: RouteLabelCopy;
    settings: RouteLabelCopy;
  };
  common: {
    read: string;
    readMore: string;
    readArticle: string;
    readStory: string;
    searchPlaceholder: string;
    topicsFilter: string;
    togglePagesTitle: string;
    prev: string;
    next: string;
    startReading: string;
    viewSeries: string;
    seriesLabel: string;
    partsSuffix: string;
    partLabel: string;
    untitled: string;
    comingSoonArts: string;
  };
  home: {
    welcomeSubtitle: string;
    creationsBadge: string;
    creationsTitle: string;
    creationsDesc: string;
    nammilName: string;
    nammilCategory: string;
    nammilPrice: string;
    nammilShortDesc: string;
    translitTitle: string;
    translitDesc: string;
    translitCta: string;
    translitSpecimenSub: string;
    navilgalBadge: string;
    navilgalTitle: string;
    navilgalDesc: string;
    poemCardBadge: string;
    poemHint: string;
    quoteCardBadge: string;
    quoteHint: string;
    articlesBadge: string;
    articlesTitle: string;
    articlesDesc: string;
  };
  navilgal: {
    pageTitle: string;
    subtitle: string;
    writingsCardTitle: string;
    writingsCardDesc: string;
    writingsCardCta: string;
    artsCardTitle: string;
    artsCardDesc: string;
    artsCardCta: string;
  };
  writings: {
    title: string;
    subtitle: string;
  };
  writingCategories: {
    poems: WritingCategoryCopy;
    quotes: WritingCategoryCopy;
    articles: WritingCategoryCopy;
    stories: WritingCategoryCopy;
    blog: WritingCategoryCopy;
    diary: WritingCategoryCopy;
  };
  arts: {
    title: string;
    subtitle: string;
    collectionGuideHeading: string;
  };
  artCategories: {
    pencil: ArtCategoryCopy;
    illustrations: ArtCategoryCopy;
    poster: ArtCategoryCopy;
    editing: ArtCategoryCopy;
    poems: ArtCategoryCopy;
    quotes: ArtCategoryCopy;
    painting: ArtCategoryCopy;
    digital_arts: ArtCategoryCopy;
  };
  tools: {
    title: string;
    subtitle: string;
    translitTitle: string;
    translitDesc: string;
    translitCta: string;
    arichuvadiTitle: string;
    arichuvadiDesc: string;
    arichuvadiCta: string;
    pianoTitle: string;
    pianoDesc: string;
    pianoCta: string;
    teachingTitle: string;
    teachingDesc: string;
    teachingCta: string;
    translitGuideTitle: string;
    translitGuideLinkArticle: string;
    translitGuideLinkArichuvadi: string;
    pianoGuideTitle: string;
    arichuvadiGuideTitle: string;
    arichuvadiAllModules: string;
    arichuvadiOpenTranslit: string;
  };
  arichuvadiModules: {
    editor: FeatureCopy;
    learn: FeatureCopy;
    practice: FeatureCopy;
    match: FeatureCopy;
    memorize: FeatureCopy;
    books: FeatureCopy;
    image: FeatureCopy;
    downloads: FeatureCopy;
    about: FeatureCopy;
  };
  teaching: {
    title: string;
    subtitle: string;
    vocoderTitle: string;
    vocoderSub: string;
    vocoderDesc: string;
    vocoderCta: string;
    paleographyTitle: string;
    paleographySub: string;
    paleographyDesc: string;
    paleographyCta: string;
  };
  downloads: {
    title: string;
    subtitle: string;
  };
  nammil: {
    title: string;
    categoryTag: string;
    price: string;
    heroDesc: string;
    downloadBtn: string;
    githubBtn: string;
    screenshotsHeading: string;
    descriptionHeading: string;
    showMore: string;
    showLess: string;
    featuresHeading: string;
    additionalInfoHeading: string;
    publishedBy: string;
    lastUpdated: string;
    releaseDate: string;
    categoryLabel: string;
    sizeLabel: string;
    installLabel: string;
    capabilitiesLabel: string;
    languagesLabel: string;
    publisherInfoLabel: string;
    termsLabel: string;
    reportLabel: string;
    versionLabel: string;
    developedByLabel: string;
    legalDisclaimersLabel: string;
    features: {
      sandboxTitle: string;
      sandboxDesc: string;
      mediaTitle: string;
      mediaDesc: string;
      chimesTitle: string;
      chimesDesc: string;
      langTitle: string;
      langDesc: string;
    };
  };
  settingsPage: {
    title: string;
    subtitle: string;
    scriptSectionLabel: string;
    appearanceSectionLabel: string;
    modeBilingualDesc: string;
    modeTanglishEnDesc: string;
    modeTanglishDesc: string;
    themeAutoDesc: string;
    themeDarkDesc: string;
    themeLightDesc: string;
    previewBadge: string;
    previewSample: string;
    comingSoonTitle: string;
    comingSoonDesc: string;
  };
  about: {
    nameTitle: string;
    explorePortfolio: string;
    defaultQuote: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    directInfoTitle: string;
    creatorLabel: string;
    creatorRole: string;
    emailLabel: string;
    copyEmail: string;
    copiedEmail: string;
    locationLabel: string;
    responseLabel: string;
    responseValue: string;
    webProfilesLabel: string;
    sendMsgTitle: string;
    sendMsgDesc: string;
    nameField: string;
    emailField: string;
    subjectField: string;
    msgField: string;
    submitBtn: string;
    sentSuccess: string;
  };
  portfolio: {
    title: string;
    subtitle: string;
    comingTitle: string;
    comingDesc: string;
  };
  notFound: {
    heading: string;
    subtext: string;
  };
  reader: {
    breadcrumbHome: string;
    breadcrumbWritings: string;
    meaning: string;
    meaningSub: string;
    notes: string;
    notesSub: string;
    lockedPrompt: string;
    hintPrefix: string;
    passwordPlaceholder: string;
    unlockBtn: string;
    wrongPassword: string;
    continueReading: string;
    chaptersHeading: string;
    chaptersSub: string;
    episodesSuffix: string;
    startReadingPart1: string;
    startReadingEpisode: string;
    aboutWorkHeading: string;
    allPrefix: string;
    exploreAllWritings: string;
    langLabels: Record<string, string>;
  };
}
