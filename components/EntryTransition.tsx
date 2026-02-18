import React from 'react';
import Animated, {
    FadeInDown,
    FadeInUp,
    Layout
} from 'react-native-reanimated';

interface EntryTransitionProps {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down';
}

export const EntryTransition: React.FC<EntryTransitionProps> = ({
    children,
    delay = 0,
    direction = 'down'
}) => {
    const EnteringAnimation = direction === 'down' ? FadeInDown : FadeInUp;

    return (
        <Animated.View
            entering={EnteringAnimation.delay(delay).duration(600)}
            layout={Layout.springify().damping(15)}
        >
            {children}
        </Animated.View>
    );
};
