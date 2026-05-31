import { createTheme, alpha } from '@mui/material/styles';

// ═══════════════════════════════════════════════════
// M3 EXPRESSIVE — DARK THEME
// Google Material Design 3 "Expressive" style
// Fluid, rounded, tonal, dynamic
// ═══════════════════════════════════════════════════

// M3 Tonal Palette — Dark scheme
const palette = {
  // Primary tonal
  primary: '#c9c5ff',        // primary80
  primaryContainer: '#2d2b6e', // primary30 (tonal container)
  onPrimary: '#1b1a4e',
  onPrimaryContainer: '#e5deff',

  // Secondary tonal
  secondary: '#c9c3dc',
  secondaryContainer: '#3e3852', // secondary30
  onSecondary: '#312c46',
  onSecondaryContainer: '#e5dff9',

  // Tertiary tonal
  tertiary: '#edb8c8',
  tertiaryContainer: '#5d3545', // tertiary30
  onTertiary: '#492532',
  onTertiaryContainer: '#ffd9e4',

  // Surfaces (M3 surface containers)
  surface: '#0f0d13',
  surfaceDim: '#0f0d13',
  surfaceBright: '#363438',
  surfaceContainerLowest: '#0a080e',
  surfaceContainerLow: '#1c1a1f',
  surfaceContainer: '#201e23',
  surfaceContainerHigh: '#2a282e',
  surfaceContainerHighest: '#353339',

  // On-surface
  onSurface: '#e6e1e6',
  onSurfaceVariant: '#c9c4cf',
  outline: '#938f99',
  outlineVariant: '#49454f',

  // Inverse
  inverseSurface: '#e6e1e6',
  inverseOnSurface: '#322f35',
  inversePrimary: '#5f5c99',

  // Error
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  // Success (custom)
  success: '#81c995',
  successContainer: '#1b5e20',

  // Scrim
  scrim: '#000000',
  shadow: '#000000',
};

const nirvaagiTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-theme',
  },
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: palette.primary,
          dark: palette.primaryContainer,
          contrastText: palette.onPrimary,
        },
        secondary: {
          main: palette.secondary,
          dark: palette.secondaryContainer,
          contrastText: palette.onSecondary,
        },
        error: {
          main: palette.error,
          dark: palette.errorContainer,
          contrastText: palette.onError,
        },
        success: {
          main: palette.success,
          dark: palette.successContainer,
        },
        warning: {
          main: '#fdd663',
        },
        background: {
          default: palette.surface,
          paper: palette.surfaceContainerLow,
        },
        text: {
          primary: palette.onSurface,
          secondary: palette.onSurfaceVariant,
          disabled: palette.outline,
        },
        divider: palette.outlineVariant,
        action: {
          hover: alpha(palette.onSurface, 0.08),
          selected: 'rgba(var(--mui-palette-primary-mainChannel), 0.12)',
          focus: 'rgba(var(--mui-palette-primary-mainChannel), 0.12)',
        },
      }
    },
    light: {
      palette: {
        primary: {
          main: '#4f4b93',
          dark: '#383477',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#605b71',
          dark: '#484459',
          contrastText: '#ffffff',
        },
        error: {
          main: '#ba1a1a',
          dark: '#93000a',
          contrastText: '#ffffff',
        },
        success: {
          main: '#1b5e20',
          dark: '#0d3b13',
        },
        warning: {
          main: '#f9a825',
        },
        background: {
          default: '#fdf8ff',
          paper: '#f4eef7',
        },
        text: {
          primary: '#1c1b1f',
          secondary: '#49454f',
          disabled: '#1c1b1f61',
        },
        divider: '#cac4d0',
        action: {
          hover: 'rgba(28, 27, 31, 0.08)',
          selected: 'rgba(79, 75, 147, 0.12)',
          focus: 'rgba(79, 75, 147, 0.12)',
        },
      }
    }
  },

  shape: {
    borderRadius: 8, // Standard modern rounding
  },

  typography: {
    fontFamily: '"Google Sans", "Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 400, fontSize: '2.25rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontWeight: 400, fontSize: '1.75rem', lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontWeight: 500, fontSize: '1.5rem', lineHeight: 1.3 },
    h4: { fontWeight: 500, fontSize: '1.25rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    subtitle1: { fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5, letterSpacing: '0.01em' },
    subtitle2: { fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.5, letterSpacing: '0.01em' },
    body1: { fontWeight: 400, fontSize: '0.95rem', lineHeight: 1.6, letterSpacing: '0.01em' },
    body2: { fontWeight: 400, fontSize: '0.85rem', lineHeight: 1.5, letterSpacing: '0.02em' },
    caption: { fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.03em' },
    overline: { fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.5, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
    button: { textTransform: 'none' as const, fontWeight: 600, letterSpacing: '0.02em' },
  },

  shadows: [
    'none',
    `0 1px 3px ${'rgba(0,0,0,0.3)'}, 0 1px 2px ${'rgba(0,0,0,0.2)'}`,
    `0 2px 6px ${'rgba(0,0,0,0.3)'}, 0 1px 4px ${'rgba(0,0,0,0.2)'}`,
    `0 4px 12px ${'rgba(0,0,0,0.3)'}`,
    `0 6px 16px ${'rgba(0,0,0,0.35)'}`,
    `0 8px 24px ${'rgba(0,0,0,0.35)'}`,
    `0 12px 32px ${'rgba(0,0,0,0.4)'}`,
    ...Array(18).fill(`0 16px 48px ${'rgba(0,0,0,0.4)'}`),
  ] as any,

  components: {
    // ── CssBaseline ──
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'var(--mui-palette-background-default)',
          color: 'var(--mui-palette-text-primary)',
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.outlineVariant} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: palette.outlineVariant,
            borderRadius: 3,
          },
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${palette.outlineVariant} transparent`,
        },
      },
    },

    // ── Paper (M3 surface containers) ──
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          border: 'none',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        },
      },
    },

    // ── Card (M3 Filled Card) ──
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          
          borderRadius: 16,
          border: 'none',
          transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': {
            
          },
        },
      },
    },

    // ── Button (M3 Filled Tonal) ──
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '8px 20px',
          fontWeight: 600,
          fontSize: '0.85rem',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        },
        contained: {
          backgroundColor: 'var(--mui-palette-primary-main)',
          color: 'var(--mui-palette-primary-contrastText)',
          '&:hover': {
            backgroundColor: 'var(--mui-palette-primary-main)', opacity: 0.85,
            boxShadow: `0 1px 3px ${'rgba(0,0,0,0.3)'}`,
          },
        },
        outlined: {
          borderColor: 'var(--mui-palette-divider)',
          color: 'var(--mui-palette-primary-main)',
          '&:hover': {
            borderColor: 'var(--mui-palette-primary-main)',
            backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel), 0.08)',
          },
        },
        text: {
          color: 'var(--mui-palette-primary-main)',
          '&:hover': {
            backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel), 0.08)',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8rem',
          borderRadius: 24,
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '0.95rem',
          borderRadius: 28,
        },
      },
    },

    // ── IconButton ──
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': {
            backgroundColor: 'var(--mui-palette-action-hover)',
          },
        },
      },
    },

    // ── Drawer (M3 Navigation Drawer) ──
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          
          borderRight: 'none',
          borderRadius: 0,
        },
      },
    },

    // ── ListItemButton (M3 Nav Item) ──
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 0',
          padding: '8px 16px',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          '&.Mui-selected': {
            backgroundColor: 'var(--mui-palette-secondary-main)',
            color: 'var(--mui-palette-secondary-contrastText)',
            '&:hover': {
              backgroundColor: 'var(--mui-palette-secondary-main)', opacity: 0.85,
            },
            '& .MuiListItemIcon-root': {
              color: 'var(--mui-palette-secondary-contrastText)',
            },
          },
          '&:hover': {
            backgroundColor: 'var(--mui-palette-action-hover)',
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 0,
          color: 'var(--mui-palette-text-secondary)',
        },
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          color: 'var(--mui-palette-text-secondary)',
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          lineHeight: '32px',
          paddingLeft: 24,
        },
      },
    },

    // ── TextField (M3 Filled) ──
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
        size: 'small',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiFilledInput-root': {
            borderRadius: 16,
            
            border: `1px solid transparent`,
            transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
            '&:hover': {
              backgroundColor: 'var(--mui-palette-action-hover)',
            },
            '&.Mui-focused': {
              
              borderColor: 'var(--mui-palette-primary-main)',
              boxShadow: `0 0 0 2px ${'rgba(var(--mui-palette-primary-mainChannel), 0.2)'}`,
            },
            '&::before, &::after': {
              display: 'none', // Remove underline
            },
          },
          '& .MuiInputLabel-root': {
            color: 'var(--mui-palette-text-secondary)',
            fontSize: '0.85rem',
          },
          '& .MuiInputBase-input': {
            padding: '12px 16px',
            fontSize: '0.9rem',
          },
        },
      },
    },

    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          '&::before, &::after': { display: 'none' },
        },
      },
    },

    // ── Chip (M3 Assist Chip) ──
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 28,
          transition: 'all 0.15s ease',
        },
        filled: {
          backgroundColor: 'var(--mui-palette-secondary-main)',
          color: 'var(--mui-palette-secondary-contrastText)',
        },
        outlined: {
          borderColor: 'var(--mui-palette-divider)',
          color: 'var(--mui-palette-text-secondary)',
        },
      },
    },

    // ── Tabs (M3 pill-style) ──
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
        indicator: {
          height: '100%',
          borderRadius: 20,
          backgroundColor: 'var(--mui-palette-secondary-main)',
          zIndex: 0,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          minHeight: 36,
          padding: '6px 20px',
          fontWeight: 600,
          fontSize: '0.8rem',
          color: 'var(--mui-palette-text-secondary)',
          zIndex: 1,
          textTransform: 'none',
          transition: 'color 0.2s',
          '&.Mui-selected': {
            color: 'var(--mui-palette-secondary-contrastText)',
          },
        },
      },
    },

    // ── Dialog (M3) ──
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          
          backgroundImage: 'none',
          border: 'none',
          padding: 8,
        },
      },
    },

    // ── Popover ──
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          
          backgroundImage: 'none',
          border: 'none',
          boxShadow: `0 8px 32px ${'rgba(0,0,0,0.4)'}`,
        },
      },
    },

    // ── Menu ──
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          
          backgroundImage: 'none',
          border: 'none',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 4px',
          padding: '8px 16px',
          fontSize: '0.85rem',
          transition: 'all 0.15s ease',
        },
      },
    },

    // ── Switch (M3 toggle) ──
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 32,
          padding: 0,
        },
        switchBase: {
          padding: '4px',
          '&.Mui-checked': {
            color: 'var(--mui-palette-primary-contrastText)',
            transform: 'translateX(20px)',
            '& + .MuiSwitch-track': {
              backgroundColor: 'var(--mui-palette-primary-main)',
              opacity: 1,
              border: 'none',
            },
            '& .MuiSwitch-thumb': {
              backgroundColor: palette.onPrimary,
              width: 24,
              height: 24,
              margin: 0,
            },
          },
        },
        thumb: {
          width: 16,
          height: 16,
          margin: '4px',
          backgroundColor: 'var(--mui-palette-divider)',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        },
        track: {
          borderRadius: 16,
          
          border: `2px solid ${palette.outline}`,
          opacity: 1,
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        },
      },
    },

    // ── ToggleButtonGroup (M3 segmented) ──
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          
          border: `1px solid ${palette.outline}`,
          padding: 4,
          gap: 4,
        },
        grouped: {
          border: 'none',
          borderRadius: '16px !important',
          margin: 0,
          '&.Mui-selected': {
            backgroundColor: 'var(--mui-palette-secondary-main)',
            color: 'var(--mui-palette-secondary-contrastText)',
            '&:hover': {
              backgroundColor: 'var(--mui-palette-secondary-main)', opacity: 0.85,
            },
          },
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          padding: '6px 16px',
          fontWeight: 600,
          fontSize: '0.8rem',
          textTransform: 'none',
          color: 'var(--mui-palette-text-secondary)',
          borderRadius: 16,
        },
      },
    },

    // ── Avatar ──
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },

    // ── Accordion (M3) ──
    MuiAccordion: {
      defaultProps: { elevation: 0, disableGutters: true },
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          borderRadius: '12px !important',
          border: 'none',
          '&::before': { display: 'none' },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          minHeight: 48,
          padding: '0 16px',
          '&.Mui-expanded': { minHeight: 48 },
        },
        content: {
          margin: '12px 0',
          '&.Mui-expanded': { margin: '12px 0' },
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 16px 16px',
        },
      },
    },

    // ── Breadcrumbs ──
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
        },
        separator: {
          color: palette.outline,
        },
      },
    },



    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          border: `1px solid ${palette.outlineVariant}`,
          boxShadow: '0px 8px 24px rgba(0,0,0,0.6)',
          borderRadius: 12,
        },
      },
    },

    // ── Snackbar / Alert ──
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },

    // ── Tooltip ──
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: palette.inverseSurface,
          color: palette.inverseOnSurface,
          fontWeight: 500,
          fontSize: '0.75rem',
          padding: '6px 12px',
        },
      },
    },

    // ── Divider ──
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.outlineVariant,
        },
      },
    },

    // ── Pagination ──
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          '&.Mui-selected': {
            backgroundColor: 'var(--mui-palette-secondary-main)',
            color: 'var(--mui-palette-secondary-contrastText)',
          },
        },
      },
    },

    // ── Skeleton ──
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          
        },
      },
    },

    // ── Fab (M3 Extended FAB) ──
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'var(--mui-palette-primary-dark)',
          color: 'var(--mui-palette-primary-contrastText)',
          boxShadow: `0 4px 12px ${'rgba(0,0,0,0.3)'}`,
          '&:hover': {
            backgroundColor: 'var(--mui-palette-primary-dark)', opacity: 0.85,
            boxShadow: `0 6px 20px ${'rgba(0,0,0,0.4)'}`,
          },
        },
        extended: {
          borderRadius: 16,
          padding: '0 20px',
          gap: 8,
        },
      },
    },

    // ── AppBar (flat) ──
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          
          borderBottom: 'none',
          boxShadow: 'none',
        },
      },
    },

    // ── Collapse ──
    MuiCollapse: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
        },
      },
    },

    // ── Backdrop ──
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(4px)',
          backgroundColor: alpha(palette.scrim, 0.5),
          '&.MuiBackdrop-invisible': {
            backdropFilter: 'none',
            backgroundColor: 'transparent',
          }
        },
      },
    },
  },
});

export default nirvaagiTheme;

// ── Export palette for direct access in components ──
export { palette as m3 };
