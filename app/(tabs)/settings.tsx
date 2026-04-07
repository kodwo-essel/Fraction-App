import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { ArchiveRestore, ChevronRight, Database, HardDrive, Info, Lock, Settings2, Share2, Trash2, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useAlert } from '../../context/AlertContext';
import { EntryTransition } from '../../components/EntryTransition';
import { PressableScale } from '../../components/PressableScale';
import { Text, Card } from '../../components/Themed';
import { initDatabase } from '../../services/database';
import { createBackup, pickBackupFile, applyBackup, exportConfig, pickConfigFile, applyConfig } from '../../services/backup';

export default function Settings() {
    const { isLoading, clearTransactions, resetDatabase, refreshData, userName, setUserName, currencyCode, theme, themeMode, setThemeMode } = useApp();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [biometrics, setBiometrics] = useState(false);
    const [tempUserName, setTempUserName] = useState(userName || '');

    useEffect(() => {
        const loadSettings = async () => {
            const biom = await AsyncStorage.getItem('biometric_enabled');
            setBiometrics(biom === 'true');
        };
        loadSettings();
    }, []);

    useEffect(() => {
        setTempUserName(userName || '');
    }, [userName]);

    const styles = React.useMemo(() => getStyles(theme, themeMode), [theme, themeMode]);

    if (isLoading) return null;

    const handleSaveName = async () => {
        await setUserName(tempUserName);
        showAlert({ title: 'Updated', message: 'User identity has been updated successfully.' });
    };

    const toggleBiometrics = async (value: boolean) => {
        if (value) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                showAlert({ 
                    title: 'Not Available', 
                    message: 'Biometric authentication is not set up on this device.' 
                });
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Enable Biometric Lock',
            });

            if (result.success) {
                setBiometrics(true);
                await AsyncStorage.setItem('biometric_enabled', 'true');
            }
        } else {
            setBiometrics(false);
            await AsyncStorage.setItem('biometric_enabled', 'false');
        }
    };

    const handleClearData = () => {
        showAlert({
            title: 'Clear History',
            message: 'This will erase all recorded transactions. Your rules and architecture will remain intact.',
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await clearTransactions();
                        showAlert({ title: 'Success', message: 'Transactions have been cleared.' });
                    }
                }
            ]
        });
    };

    const handleResetApp = () => {
        showAlert({
            title: 'Reset Everything',
            message: 'This action wipes everything: identity, rules, and history. The app will return to its original state.',
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await resetDatabase();
                        showAlert({ title: 'Success', message: 'The system has been completely reset.' });
                    }
                }
            ]
        });
    };

    const handleBackup = async () => {
        try {
            const db = await initDatabase();
            await createBackup(db, currencyCode, userName || '');
        } catch (e: any) {
            showAlert({ title: 'Backup Failed', message: e.message || 'Could not create backup.' });
        }
    };

    const handleRestore = async () => {
        try {
            const db = await initDatabase();

            // Step 1: open file picker FIRST — no alert before this
            const picked = await pickBackupFile(db);

            if (picked.status === 'cancelled') return;

            if (picked.status === 'duplicate') {
                showAlert({
                    title: 'Already Applied',
                    message: 'This backup has already been restored. No changes were made.',
                });
                return;
            }

            if (picked.status === 'invalid') {
                showAlert({ title: 'Invalid File', message: picked.reason });
                return;
            }

            // Step 2: file is valid — now show confirmation (picker is fully closed)
            const { data } = picked;
            const backupDate = data.backup.created_at
                ? new Date(data.backup.created_at).toLocaleDateString()
                : 'unknown date';

            showAlert({
                title: 'Confirm Restore',
                message: `Backup from ${backupDate} found. This will replace your current data. Continue?`,
                buttons: [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Yes',
                        style: 'default',
                        onPress: async () => {
                            try {
                                await applyBackup(db, data);
                                if (refreshData) await refreshData();
                                showAlert({
                                    title: 'Restored',
                                    message: `Your data has been restored successfully.`,
                                });
                            } catch (e: any) {
                                showAlert({ title: 'Restore Failed', message: e.message || 'Could not restore backup.' });
                            }
                        }
                    }
                ]
            });
        } catch (e: any) {
            showAlert({ title: 'Restore Failed', message: e.message || 'Could not restore backup.' });
        }
    };

    const handleShareConfig = async () => {
        try {
            const db = await initDatabase();
            await exportConfig(db);
        } catch (e: any) {
            showAlert({ title: 'Export Failed', message: e.message || 'Could not export configuration.' });
        }
    };

    const handleImportConfig = async () => {
        try {
            const db = await initDatabase();

            // Picker opens first — no alert before
            const picked = await pickConfigFile();

            if (picked.status === 'cancelled') return;

            if (picked.status === 'invalid') {
                showAlert({ title: 'Invalid File', message: picked.reason });
                return;
            }

            const { data } = picked;
            const ruleCount = data.categories.filter((c: any) => c.type === 'main').length;

            showAlert({
                title: 'Import Configuration',
                message: `Found ${ruleCount} rule${ruleCount !== 1 ? 's' : ''}. This will replace your current rules. Your transactions will not be affected. Continue?`,
                buttons: [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Import',
                        style: 'default',
                        onPress: async () => {
                            try {
                                await applyConfig(db, data);
                                if (refreshData) await refreshData();
                                showAlert({ title: 'Done', message: 'Configuration imported successfully.' });
                            } catch (e: any) {
                                showAlert({ title: 'Import Failed', message: e.message || 'Could not apply configuration.' });
                            }
                        }
                    }
                ]
            });
        } catch (e: any) {
            showAlert({ title: 'Import Failed', message: e.message || 'Could not import configuration.' });
        }
    };

    const NavItem = ({ icon: Icon, label, value, type = 'chevron', color, onPress }: any) => {
        const iconColor = color || theme.colors.text;
        return (
            <PressableScale onPress={onPress}>
                <View style={styles.navItem}>
                    <View style={styles.navLeft}>
                        <View style={[styles.iconBox, { backgroundColor: type === 'destructive' ? 'rgba(239, 68, 68, 0.1)' : (themeMode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)') }]}>
                            <Icon size={18} color={iconColor} />
                        </View>
                        <Text variant="body" style={[styles.navLabel, { color: iconColor }]}>{label}</Text>
                    </View>
                    <View style={styles.navRight}>
                        {value && <Text variant="caption" color="textSecondary" style={{ marginRight: 8 }}>{value}</Text>}
                        <ChevronRight size={18} color={theme.colors.textSecondary} />
                    </View>
                </View>
            </PressableScale>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 140 }
                ]}
            >
                <EntryTransition delay={0}>
                    <View style={styles.header}>
                        <Text variant="h1" style={styles.title}>Settings</Text>
                        <Text variant="label" color="textSecondary">Configure your experience</Text>
                    </View>
                </EntryTransition>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>User Identity</Text>
                    <Card style={styles.sectionCard}>
                        <View style={styles.navItem}>
                            <View style={styles.navLeft}>
                                <View style={[styles.iconBox, { backgroundColor: themeMode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }]}>
                                    <User size={18} color={theme.colors.text} />
                                </View>
                                <TextInput
                                    style={[styles.nameInput, { color: theme.colors.text }]}
                                    value={tempUserName}
                                    onChangeText={setTempUserName}
                                    placeholder="Your Name"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    selectionColor={theme.colors.primary}
                                />
                            </View>
                            {tempUserName !== (userName || '') && (
                                <PressableScale onPress={handleSaveName} style={[styles.saveAction, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    <Text variant="caption" color="success" style={{ fontFamily: theme.typography.fontFamily.bold }}>Save</Text>
                                </PressableScale>
                            )}
                        </View>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Appearance</Text>
                    <Card style={styles.sectionCard}>
                        <View style={styles.navItem}>
                            <View style={styles.navLeft}>
                                <View style={[styles.iconBox, { backgroundColor: themeMode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }]}>
                                    <Lock size={18} color={theme.colors.text} />
                                </View>
                                <Text variant="body" style={styles.navLabel}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={themeMode === 'dark'}
                                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                thumbColor={theme.colors.background}
                            />
                        </View>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Security</Text>
                    <Card style={styles.sectionCard}>
                        <View style={styles.navItem}>
                            <View style={styles.navLeft}>
                                <View style={[styles.iconBox, { backgroundColor: themeMode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }]}>
                                    <Lock size={18} color={theme.colors.text} />
                                </View>
                                <Text variant="body" style={styles.navLabel}>Biometric Lock</Text>
                            </View>
                            <Switch
                                value={biometrics}
                                onValueChange={toggleBiometrics}
                                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                thumbColor={theme.colors.background}
                            />
                        </View>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>System Configuration</Text>
                    <Card style={styles.sectionCard}>
                        <NavItem 
                            icon={Database} 
                            label="My Rules" 
                            value={currencyCode}
                            onPress={() => router.push('/configuration')} 
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Backup & Restore</Text>
                    <Card style={styles.sectionCard}>
                        <NavItem
                            icon={HardDrive}
                            label="Backup Data"
                            onPress={handleBackup}
                        />
                        <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
                        <NavItem
                            icon={ArchiveRestore}
                            label="Restore Data"
                            onPress={handleRestore}
                        />
                        <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
                        <NavItem
                            icon={Share2}
                            label="Share Config"
                            onPress={handleShareConfig}
                        />
                        <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
                        <NavItem
                            icon={Settings2}
                            label="Import Config"
                            onPress={handleImportConfig}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Data Management</Text>
                    <Card style={styles.sectionCard}>
                        <NavItem 
                            icon={Trash2} 
                            label="Clear Transaction History" 
                            color={theme.colors.error}
                            type="destructive"
                            onPress={handleClearData}
                        />
                        <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
                        <NavItem 
                            icon={Database} 
                            label="Reset ALL System Data" 
                            color={theme.colors.error}
                            type="destructive"
                            onPress={handleResetApp}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Information</Text>
                    <Card style={styles.sectionCard}>
                        <NavItem icon={Info} label="Version" value="1.0.0" type="text" onPress={() => {}} />
                    </Card>
                </View>

                <View style={styles.footer}>
                    <Text variant="caption" color="textSecondary" style={styles.footerText}>
                         Nkyekyɛmu • Powered by Hisho
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const getStyles = (theme: any, mode: string) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    header: {
        marginBottom: theme.spacing.xxl,
    },
    title: {
        letterSpacing: -1.5,
        marginBottom: 2,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
        marginBottom: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
    },
    sectionCard: {
        padding: 0,
        overflow: 'hidden',
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
    },
    navLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    navRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    navLabel: {
        fontFamily: theme.typography.fontFamily.medium,
    },
    nameInput: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.size.md,
        padding: 0,
    },
    saveAction: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    separator: {
        height: 1,
        marginLeft: 64,
    },
    footer: {
        marginTop: theme.spacing.xxl,
        alignItems: 'center',
    },
    footerText: {
        opacity: 0.5,
    },
});
