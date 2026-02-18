export const theme = {
    colors: {
        background: '#FFFFFF',
        text: '#000000',
        textSecondary: '#666666',
        border: '#E0E0E0',
        pressed: '#F0F0F0',
        white: '#FFFFFF',
        black: '#000000',
        gray: {
            light: '#F5F5F5',
            medium: '#999999',
            dark: '#333333',
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        size: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 20,
            xl: 24,
            xxl: 32,
        },
        weight: {
            light: '300',
            regular: '400',
            medium: '500',
            bold: '700',
        },
    },
    roundness: {
        sm: 4,
        md: 8,
        lg: 12,
        full: 9999,
    },
} as const;
