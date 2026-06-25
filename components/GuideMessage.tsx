import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Text } from './Themed';
import { useApp } from '../context/AppContext';
import { getAvatar, getRandomDialogue, GuideSituation } from '../constants/avatars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GuideMessageProps {
    situation: GuideSituation;
}

export function GuideMessage({ situation }: GuideMessageProps) {
    const { theme, avatarId, categories, transactions, getCategoryBalance, currencyCode } = useApp();
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const avatar = getAvatar(avatarId);

    // Calculate financial context for the avatar
    const totalBalance = categories.reduce((sum, cat) => sum + getCategoryBalance(cat.id), 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    useEffect(() => {
        const context = {
            balance: totalBalance,
            income: totalIncome,
            expense: totalExpense,
            currencyCode
        };
        // Change message when situation or avatar changes, and auto-show the bubble
        setMessage(getRandomDialogue(avatarId, situation, context));
        setIsVisible(true);
    }, [situation, avatarId, totalBalance, totalIncome, totalExpense, currencyCode]);

    const toggleBubble = () => {
        setIsVisible(!isVisible);
    };

    return (
        <View style={[styles.container, { bottom: insets.bottom + 100 }]} pointerEvents="box-none">
            {isVisible && (
                <Animated.View 
                    entering={FadeInDown.springify().damping(15)} 
                    exiting={FadeOutUp}
                    style={[
                        styles.bubble, 
                        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }
                    ]}
                >
                    <Text variant="caption" style={{ color: theme.colors.text }}>{message}</Text>
                    {/* A small triangle for the speech bubble pointing down-right */}
                    <View style={[styles.triangle, { borderTopColor: theme.colors.border }]} />
                    <View style={[styles.triangleInner, { borderTopColor: theme.colors.surfaceElevated }]} />
                </Animated.View>
            )}
            <TouchableOpacity activeOpacity={0.8} onPress={toggleBubble} style={styles.avatarButton}>
                <Image source={avatar.image} style={styles.avatar} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 20,
        alignItems: 'flex-end',
        zIndex: 9999,
        elevation: 10,
    },
    bubble: {
        padding: 16,
        borderRadius: 16,
        borderBottomRightRadius: 4,
        marginBottom: 12,
        maxWidth: 220,
        borderWidth: 1,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    triangle: {
        position: 'absolute',
        bottom: -9,
        right: 18,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderTopWidth: 9,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    triangleInner: {
        position: 'absolute',
        bottom: -7,
        right: 19,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    avatarButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: '#000', // fallback in case image takes time to load
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
    }
});
