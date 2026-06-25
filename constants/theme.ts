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

export interface ThemeColors {
    background: string;
    surface: string;
    surfaceElevated: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    pressed: string;
    error: string;
    success: string;
    white: string;
    black: string;
    zinc: typeof palette.zinc;
}

export type Theme = {
    spacing: typeof commonTokens.spacing;
    typography: typeof commonTokens.typography;
    roundness: typeof commonTokens.roundness;
    colors: ThemeColors;
};

export const themes: Record<string, Theme> = {
    minimalist: {
        ...commonTokens,
        colors: {
            background: palette.white,
            surface: 'rgba(0, 0, 0, 0.02)',
            surfaceElevated: palette.zinc[50],
            primary: palette.black,
            secondary: 'rgba(0, 0, 0, 0.05)',
            accent: palette.black,
            text: palette.black,
            textSecondary: palette.zinc[500],
            border: 'rgba(0, 0, 0, 0.05)',
            pressed: 'rgba(0, 0, 0, 0.03)',
            error: palette.ruby,
            success: palette.emerald,
            white: palette.white,
            black: palette.black,
            zinc: palette.zinc,
        },
    },
    ocean: {
        ...commonTokens,
        colors: {
            background: '#F0F8FF', // Alice Blue
            surface: 'rgba(0, 50, 100, 0.03)',
            surfaceElevated: '#E6F3FF',
            primary: '#005A9C', // Dark Blue
            secondary: 'rgba(0, 90, 156, 0.08)',
            accent: '#007FFF',
            text: '#001F3F',
            textSecondary: '#4A6572',
            border: 'rgba(0, 90, 156, 0.1)',
            pressed: 'rgba(0, 90, 156, 0.05)',
            error: palette.ruby,
            success: palette.emerald,
            white: palette.white,
            black: palette.black,
            zinc: palette.zinc,
        },
    },
    sunset: {
        ...commonTokens,
        colors: {
            background: '#FFF8F0', // Warm off-white
            surface: 'rgba(200, 80, 0, 0.03)',
            surfaceElevated: '#FFEFE0',
            primary: '#D95319', // Burnt Orange
            secondary: 'rgba(217, 83, 25, 0.08)',
            accent: '#FF7F50',
            text: '#4A2511',
            textSecondary: '#8B5A44',
            border: 'rgba(217, 83, 25, 0.1)',
            pressed: 'rgba(217, 83, 25, 0.05)',
            error: palette.ruby,
            success: palette.emerald,
            white: palette.white,
            black: palette.black,
            zinc: palette.zinc,
        },
    },
    forest: {
        ...commonTokens,
        colors: {
            background: '#F4FAF4', // Soft Mint
            surface: 'rgba(0, 100, 0, 0.03)',
            surfaceElevated: '#E8F5E9',
            primary: '#1B5E20', // Dark Green
            secondary: 'rgba(27, 94, 32, 0.08)',
            accent: '#2E7D32',
            text: '#0D2B0E',
            textSecondary: '#455A46',
            border: 'rgba(27, 94, 32, 0.1)',
            pressed: 'rgba(27, 94, 32, 0.05)',
            error: palette.ruby,
            success: palette.emerald,
            white: palette.white,
            black: palette.black,
            zinc: palette.zinc,
        },
    },
    lavender: {
        ...commonTokens,
        colors: {
            background: '#F8F4FF', // Soft Lavender
            surface: 'rgba(80, 0, 150, 0.03)',
            surfaceElevated: '#F0E6FF',
            primary: '#512DA8', // Deep Purple
            secondary: 'rgba(81, 45, 168, 0.08)',
            accent: '#673AB7',
            text: '#221144',
            textSecondary: '#5E4B82',
            border: 'rgba(81, 45, 168, 0.1)',
            pressed: 'rgba(81, 45, 168, 0.05)',
            error: palette.ruby,
            success: palette.emerald,
            white: palette.white,
            black: palette.black,
            zinc: palette.zinc,
        },
    }
};

export const defaultTheme = themes.minimalist;
