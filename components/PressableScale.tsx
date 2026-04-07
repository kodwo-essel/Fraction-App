import React from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';

interface PressableScaleProps extends PressableProps {
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScale: React.FC<PressableScaleProps> = ({
    style,
    children,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const { theme } = useApp();
    const styles = getStyles(theme);
    const flattenedStyle = StyleSheet.flatten(style);
    const baseColor = (flattenedStyle?.backgroundColor as string) || theme.colors.background;

    const scale = useSharedValue(1);
    const backgroundColor = useSharedValue<string>(baseColor);

    React.useEffect(() => {
        backgroundColor.value = baseColor;
    }, [baseColor, theme]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: backgroundColor.value,
    }));

    const handlePressIn = (event: any) => {
        scale.value = withSpring(1.02, { damping: 12, stiffness: 200 });
        
        let pressedColor = 'rgba(255, 255, 255, 0.15)';
        if (baseColor === theme.colors.primary || baseColor === theme.colors.text) {
          pressedColor = theme.colors.zinc[200];
        } else if (baseColor === theme.colors.background) {
          pressedColor = theme.colors.surfaceElevated;
        }
        
        backgroundColor.value = withTiming(pressedColor, { duration: 100 });
        onPressIn?.(event);
    };

    const handlePressOut = (event: any) => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
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

const getStyles = (theme: any) => StyleSheet.create({
    base: {
        borderRadius: theme.roundness.md,
        overflow: 'hidden',
    },
});
