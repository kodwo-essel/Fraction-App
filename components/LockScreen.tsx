import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { PressableScale } from './PressableScale';

interface LockScreenProps {
    onAuthenticate: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onAuthenticate }) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.title}>Fraction</Text>
                <Text style={styles.subtitle}>Authentication required to view your financial records.</Text>

                <PressableScale style={styles.button} onPress={onAuthenticate}>
                    <Text style={styles.buttonText}>Unlock App</Text>
                </PressableScale>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: theme.colors.gray.light,
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
        fontWeight: theme.typography.weight.bold as any,
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
        backgroundColor: theme.colors.text,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xxl,
        borderRadius: theme.roundness.md,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.background,
        fontWeight: theme.typography.weight.bold as any,
        fontSize: theme.typography.size.md,
    },
});
