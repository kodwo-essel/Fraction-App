import React from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { theme } from '../constants/theme';

interface PressableScaleProps extends PressableProps {
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScale: React.FC<PressableScaleProps> = ({
    style,
    children,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const flattenedStyle = StyleSheet.flatten(style);
    const baseColor = (flattenedStyle?.backgroundColor as string) || theme.colors.background;

    const scale = useSharedValue(1);
    const backgroundColor = useSharedValue<string>(baseColor);

    React.useEffect(() => {
        backgroundColor.value = baseColor;
    }, [baseColor]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: backgroundColor.value,
    }));

    const handlePressIn = (event: any) => {
        scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
        // If it's a black button, flash to a dark gray, otherwise use the default pressed color
        const pressedColor = baseColor === theme.colors.black ? theme.colors.gray.dark : theme.colors.pressed;
        backgroundColor.value = withTiming(pressedColor, { duration: 100 });
        onPressIn?.(event);
    };

    const handlePressOut = (event: any) => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        backgroundColor.value = withTiming(baseColor, { duration: 150 });
        onPressOut?.(event);
    };

    return (
        <AnimatedPressable
            {...props}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.base, style, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: theme.roundness.md,
        overflow: 'hidden',
    },
});
