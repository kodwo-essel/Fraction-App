import React, { useEffect } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useApp } from '../context/AppContext';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    width = '100%',
    height = 20,
    borderRadius,
    style
}) => {
    const { theme } = useApp();
    const opacity = new Animated.Value(0.3);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius: borderRadius ?? theme.roundness.sm,
                    opacity,
                    backgroundColor: theme.colors.surfaceElevated
                },
                style
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
    },
});
