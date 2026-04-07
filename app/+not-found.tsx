import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useApp } from '@/context/AppContext';

export default function NotFoundScreen() {
  const { theme } = useApp();
  const styles = getStyles(theme);

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Oops!',
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text
      }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.medium,
  },
});
