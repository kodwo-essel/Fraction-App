import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, StyleSheet, View, TouchableWithoutFeedback, Animated } from 'react-native';
import { Text, Card, Button } from '../components/Themed';
import { useApp } from './AppContext';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertOptions = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

type AlertContextType = {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const { theme, themeMode } = useApp();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const showAlert = (newOptions: AlertOptions) => {
    setOptions(newOptions);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const handleButtonPress = (onPress?: () => void) => {
    hideAlert();
    if (onPress) {
      setTimeout(onPress, 100);
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <TouchableWithoutFeedback onPress={hideAlert}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <Card style={[
                styles.alertCard, 
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }
              ]}>
                <Text variant="h3" style={styles.title}>{options?.title}</Text>
                {options?.message && (
                  <Text variant="body" color="textSecondary" style={styles.message}>
                    {options.message}
                  </Text>
                )}
                
                <View style={styles.buttonContainer}>
                  {options?.buttons && options.buttons.length > 0 ? (
                    options.buttons.map((btn, idx) => (
                      <Button
                        key={idx}
                        title={btn.text}
                        variant={btn.style === 'cancel' ? 'secondary' : 'primary'}
                        onPress={() => handleButtonPress(btn.onPress)}
                        style={[
                            styles.button,
                            options.buttons!.length > 2 ? styles.verticalButton : styles.horizontalButton
                        ]}
                      />
                    ))
                  ) : (
                    <Button
                      title="OK"
                      variant="primary"
                      onPress={() => handleButtonPress()}
                      style={styles.singleButton}
                    />
                  )}
                </View>
              </Card>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertCard: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    minWidth: 100,
  },
  singleButton: {
    width: '100%',
  },
  horizontalButton: {
    flex: 1,
  },
  verticalButton: {
    width: '100%',
  }
});
