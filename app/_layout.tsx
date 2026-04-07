import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

import { AppProvider, useApp } from '../context/AppContext';
import { LockScreen } from '../components/LockScreen';
import { SetupScreen } from '../components/SetupScreen';
import { AlertProvider } from '../context/AlertContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Chillax-Bold': require('../assets/fonts/Chillax_Complete/Fonts/OTF/Chillax-Bold.otf'),
    'Chillax-Medium': require('../assets/fonts/Chillax_Complete/Fonts/OTF/Chillax-Medium.otf'),
    'Chillax-Regular': require('../assets/fonts/Chillax_Complete/Fonts/OTF/Chillax-Regular.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AlertProvider>
            <RootLayoutInternal />
          </AlertProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutInternal() {
  const { theme, themeMode } = useApp();
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkLock = async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      if (enabled === 'true') {
        setIsLocked(true);
        authenticate();
      } else {
        setIsLocked(false);
      }
    } catch (e) {
      setIsLocked(false);
    } finally {
      setIsChecking(false);
    }
  };

  const authenticate = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Fraction',
      });
      if (result.success) {
        setIsLocked(false);
      }
    } else {
      setIsLocked(false);
    }
  };

  useEffect(() => {
    checkLock();
  }, []);

  if (isChecking) {
    return <View style={{ flex: 1, backgroundColor: theme?.colors?.background || '#000000' }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLocked ? (
        <LockScreen onAuthenticate={authenticate} />
      ) : (
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontFamily: theme.typography.fontFamily.bold,
              fontSize: theme.typography.size.lg,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="configuration" options={{ headerShown: false }} />
        </Stack>
      )}
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      <SetupScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
