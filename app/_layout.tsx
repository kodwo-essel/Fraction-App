import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { AppProvider } from '../context/AppContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import { LockScreen } from '../components/LockScreen';
import { SetupScreen } from '../components/SetupScreen';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkLock();
  }, []);

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
      // If hardware is not available or not enrolled but it was somehow enabled, 
      // we might want to allow access or ask for a fallback (which we haven't implemented)
      // For now, let's just allow access to not lock the user out permanently
      setIsLocked(false);
    }
  };

  if (isChecking) return null;

  if (isLocked) {
    return <LockScreen onAuthenticate={authenticate} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: theme.typography.weight.bold as any,
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
      <SetupScreen />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Standard system fonts or custom ones if available
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
          <RootLayoutContent />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
