import React from 'react';
import { Text as DefaultText, View as DefaultView, TouchableOpacity, TouchableOpacityProps, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { defaultTheme } from '../constants/theme';

export type TextProps = DefaultText['props'] & {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
};

export function Text(props: TextProps) {
  const { style, variant = 'body', color = 'text', ...otherProps } = props;
  const { theme } = useApp();
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return {
          fontFamily: theme.typography.fontFamily.bold,
          fontSize: theme.typography.size.xxl,
        };
      case 'h2':
        return {
          fontFamily: theme.typography.fontFamily.bold,
          fontSize: theme.typography.size.xl,
        };
      case 'h3':
        return {
          fontFamily: theme.typography.fontFamily.medium,
          fontSize: theme.typography.size.lg,
        };
      case 'label':
        return {
          fontFamily: theme.typography.fontFamily.medium,
          fontSize: theme.typography.size.sm,
          textTransform: 'uppercase' as const,
          letterSpacing: 1,
        };
      case 'caption':
        return {
          fontFamily: theme.typography.fontFamily.regular,
          fontSize: theme.typography.size.xs,
        };
      default:
        return {
          fontFamily: theme.typography.fontFamily.regular,
          fontSize: theme.typography.size.md,
        };
    }
  };

  const textColor = (theme.colors[color as keyof typeof theme.colors] || color) as string;

  return <DefaultText style={[{ color: textColor }, getVariantStyle(), style]} {...otherProps} />;
}

export type CardProps = DefaultView['props'] & {
  glass?: boolean;
  gradient?: boolean;
  gradientColors?: string[];
};

export function Card(props: CardProps) {
  const { style, glass = true, gradient = false, gradientColors, children, ...otherProps } = props;
  const { theme } = useApp();
  
  const styles = getStyles(theme);

  if (gradient) {
    const defaultColors: readonly [string, string, ...string[]] = [
      theme.colors.surface,
      theme.colors.surfaceElevated
    ];
    return (
      <LinearGradient
        colors={(gradientColors as any) || defaultColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.glassCard, style]}
        {...otherProps}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <DefaultView
      style={[
        styles.card,
        glass ? styles.glassCard : styles.solidCard,
        style
      ]}
      {...otherProps}
    >
      {children}
    </DefaultView>
  );
}

export type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
};

export function Button(props: ButtonProps) {
  const { style, title, variant = 'primary', ...otherProps } = props;
  const { theme } = useApp();
  
  const styles = getStyles(theme);

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary };
      case 'secondary':
        return { backgroundColor: theme.colors.secondary };
      case 'gradient':
        return { backgroundColor: theme.colors.primary };
      default:
        return { backgroundColor: theme.colors.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return { color: theme.colors.primary };
      case 'primary':
      case 'gradient':
        return { color: theme.colors.background };
      case 'secondary':
        return { color: theme.colors.text };
      default:
        return { color: theme.colors.textSecondary };
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.button, getButtonStyle(), style]} 
      {...otherProps}
    >
      <Text style={[styles.buttonText, getTextStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    borderWidth: 1, 
    borderColor: theme.colors.border,
  },
  glassCard: {
    backgroundColor: theme.colors.surface,
  },
  solidCard: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.roundness.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.md,
    letterSpacing: 0.5,
  },
});

