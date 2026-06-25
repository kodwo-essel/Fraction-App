import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { EntryTransition } from './EntryTransition';
import { PressableScale } from './PressableScale';
import { Text, Button } from './Themed';

export const SetupScreen: React.FC = () => {
    const { userName, setUserName, theme } = useApp();
    const router = useRouter();
    const [name, setName] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const styles = getStyles(theme);

    React.useEffect(() => {
        if (userName === null) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [userName]);

    const handleContinue = async () => {
        if (name.trim()) {
            await setUserName(name.trim());
            setIsVisible(false);
            router.replace('/(tabs)');
        }
    };

    if (!isVisible) return null;

    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            statusBarTranslucent
        >
            <StatusBar style="dark" />
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <EntryTransition delay={100}>
                        <Text variant="h1" style={styles.title}>Welcome to Fraction</Text>
                        <Text variant="body" color="textSecondary" style={styles.subtitle}>
                            Let's start by personalizing your wealth dashboard. What's your name?
                        </Text>

                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}
                            placeholder="Your Name"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                            autoCapitalize="words"
                            selectionColor={theme.colors.primary}
                        />

                        <Button
                            title="Begin Experience"
                            onPress={handleContinue}
                            disabled={!name.trim()}
                            style={[
                                styles.button,
                                !name.trim() && { opacity: 0.5 }
                            ]}
                        />
                    </EntryTransition>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    container: {
        width: '100%',
    },
    title: {
        marginBottom: theme.spacing.xs,
        letterSpacing: -1.5,
    },
    subtitle: {
        marginBottom: theme.spacing.xxl,
        lineHeight: 24,
    },
    input: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 32,
        borderBottomWidth: 1,
        paddingBottom: theme.spacing.md,
        marginBottom: theme.spacing.xxl,
    },
    button: {
        marginTop: theme.spacing.lg,
    },
});
