import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { EntryTransition } from './EntryTransition';
import { PressableScale } from './PressableScale';

export const SetupScreen: React.FC = () => {
    const { userName, setUserName } = useApp();
    const router = useRouter();
    const [name, setName] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    // Only show if userName is null
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
            <StatusBar hidden />
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <EntryTransition delay={100}>
                        <Text style={styles.title}>Welcome to Fraction</Text>
                        <Text style={styles.subtitle}>Let's start with your name.</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Your Name"
                            placeholderTextColor={theme.colors.gray.medium}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                            autoCapitalize="words"
                        />

                        <PressableScale
                            style={[
                                styles.button,
                                !name.trim() && { backgroundColor: theme.colors.gray.medium }
                            ]}
                            onPress={handleContinue}
                            disabled={!name.trim()}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </PressableScale>
                    </EntryTransition>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        fontSize: 32,
        fontWeight: theme.typography.weight.bold as any,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.size.md,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xxl,
    },
    input: {
        fontSize: 24,
        color: theme.colors.text,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.text,
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.xxl,
    },
    button: {
        backgroundColor: theme.colors.text,
        padding: theme.spacing.lg,
        borderRadius: theme.roundness.md,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.background,
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.bold as any,
    },
});
