import React, { useEffect } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { Text } from './Themed';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

interface Props {
    onFinish: () => void;
}

export function CustomSplashScreen({ onFinish }: Props) {
    const { theme } = useApp();
    const opacity = new Animated.Value(1);
    const scale = new Animated.Value(0.9);
    const translateY = new Animated.Value(20);

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(scale, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();

        // Exit animation after delay
        const timer = setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[
            styles.container, 
            { backgroundColor: theme.colors.background, opacity }
        ]}>
            <Animated.View style={[
                styles.content,
                { transform: [{ scale }, { translateY }] }
            ]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.text }]}>
                    <Text style={[styles.iconText, { color: theme.colors.background }]}>F</Text>
                </View>
                <Text variant="h1" style={[styles.brand, { color: theme.colors.text }]}>Fraction</Text>
                <Text variant="label" color="textSecondary" style={styles.tagline}>
                    Mindful Allocation
                </Text>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconText: {
        fontSize: 48,
        fontFamily: 'Chillax-Bold',
        includeFontPadding: false,
    },
    brand: {
        fontSize: 42,
        letterSpacing: -2,
        marginBottom: 8,
    },
    tagline: {
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
