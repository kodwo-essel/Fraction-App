import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { Text, Card } from '../components/Themed';

export default function ModalScreen() {
  const { theme } = useApp();
  const styles = getStyles(theme);
  
  return (
    <View style={styles.container}>
      <Card 
        gradient 
        gradientColors={['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.85)']} 
        style={styles.headerCard}
      >
        <Text variant="h1" style={styles.title}>Finance Insights</Text>
        <Text variant="caption" color="textSecondary">Premium Distribution Analysis</Text>
      </Card>
      
      <Card style={styles.content}>
        <Text variant="h2" style={styles.title}>Information</Text>
        <View style={styles.separator} />
        
        <Text variant="body" color="textSecondary" style={styles.description}>
          This is a premium information space. Use this area for additional context or settings details.
        </Text>
      </Card>

      <StatusBar style="dark" />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  headerCard: {
    width: '100%',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginTop: theme.spacing.md,
  },
  separator: {
    marginVertical: theme.spacing.md,
    height: 1,
    width: '40%',
    backgroundColor: theme.colors.border,
  },
});
