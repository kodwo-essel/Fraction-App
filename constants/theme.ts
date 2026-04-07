const palette = {
    white: '#FFFFFF',
    black: '#000000',
    zinc: {
        50: '#FAFAFA',
        100: '#F4F4F5',
        200: '#E4E4E7',
        300: '#D4D4D8',
        400: '#A1A1AA',
        500: '#71717A',
        600: '#52525B',
        700: '#3F3F46',
        800: '#27272A',
        900: '#18181B',
        950: '#09090B',
    },
    emerald: '#10B981',
    ruby: '#EF4444',
};

const commonTokens = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        fontFamily: {
            bold: 'Chillax-Bold',
            medium: 'Chillax-Medium',
            regular: 'Chillax-Regular',
        },
        size: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 20,
            xl: 24,
            xxl: 32,
            xxxl: 40,
        },
    },
    roundness: {
        sm: 8,
        md: 12,
        lg: 24,
        xl: 32,
        full: 9999,
    },
};

export const darkTheme = {
    ...commonTokens,
    colors: {
        background: palette.black,
        surface: 'rgba(255, 255, 255, 0.05)',
        surfaceElevated: palette.zinc[900],
        primary: palette.white,
        secondary: palette.zinc[800],
        accent: palette.white,
        text: palette.white,
        textSecondary: palette.zinc[500],
        border: 'rgba(255, 255, 255, 0.1)',
        pressed: 'rgba(255, 255, 255, 0.08)',
        error: palette.ruby,
        success: palette.emerald,
        white: palette.white,
        black: palette.black,
        gray: {
            light: palette.zinc[200],
            medium: palette.zinc[400],
            dark: palette.zinc[800],
        },
        zinc: palette.zinc,
    },
};

export const lightTheme = {
    ...commonTokens,
    colors: {
        background: palette.white,
        surface: 'rgba(0, 0, 0, 0.02)',
        surfaceElevated: palette.zinc[50],
        primary: palette.black,
        secondary: 'rgba(0, 0, 0, 0.05)',
        accent: palette.black,
        text: palette.black,
        textSecondary: palette.zinc[400],
        border: 'rgba(0, 0, 0, 0.05)',
        pressed: 'rgba(0, 0, 0, 0.03)',
        error: palette.ruby,
        success: palette.emerald,
        white: palette.white,
        black: palette.black,
        gray: {
            light: palette.zinc[800],
            medium: palette.zinc[500],
            dark: palette.zinc[200],
        },
        zinc: palette.zinc,
    },
};

// Default export for legacy compatibility (falls back to dark)
export const theme = darkTheme;

export type Theme = typeof theme;
