import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { Text, Card, Button } from './Themed';

interface LockScreenProps {
    onAuthenticate: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onAuthenticate }) => {
    const { theme } = useApp();
    const styles = getStyles(theme);

    return (
        <Card 
            gradient 
            gradientColors={['rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.85)']}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text variant="h1" style={styles.title}>Fraction</Text>
                <Text variant="body" color="textSecondary" style={styles.subtitle}>
                    Authentication required to view your financial records.
                </Text>

                <Button
                    title="Unlock Ledger"
                    variant="primary"
                    onPress={onAuthenticate}
                    style={styles.button}
                />
            </View>
        </Card>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xl,
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: theme.typography.size.xxl,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: theme.typography.size.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xxl,
        lineHeight: 20,
        paddingHorizontal: theme.spacing.xl,
    },
    button: {
        marginTop: theme.spacing.md,
    },
});
