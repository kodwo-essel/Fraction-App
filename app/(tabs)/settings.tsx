import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { ArchiveRestore, ChevronRight, Database, HardDrive, Info, Lock, Trash2, User, FileSpreadsheet } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EntryTransition } from '../../components/EntryTransition';
import { PressableScale } from '../../components/PressableScale';
import { Card, Text } from '../../components/Themed';
import { AVATARS } from '../../constants/avatars';
import { themes } from '../../constants/theme';
import { useAlert } from '../../context/AlertContext';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../services/exportData';
import { initDatabase } from '../../services/database';

export default function Settings() {
    const { isLoading, clearTransactions, resetDatabase, refreshData, userName, setUserName, avatarId, setAvatarId, currencyCode, theme, themeName, setThemeName } = useApp();
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

    const styles = React.useMemo(() => getStyles(theme), [theme]);

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
            message: 'This will erase all recorded transactions. Your categories and plan will remain intact.',
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
            message: 'This action wipes everything: name, categories, and activity. The app will return to its original state.',
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

    const handleExportExcel = async () => {
        const result = await exportToExcel(userName);
        if (result.success) {
            showAlert({ title: 'Export Successful', message: 'Your data has been exported to Excel.' });
        } else {
            showAlert({ title: 'Export Failed', message: 'There was an error exporting your data.' });
        }
    };



    const NavItem = ({ icon: Icon, label, value, type = 'chevron', color, onPress }: any) => {
        const iconColor = color || theme.colors.text;
        return (
            <PressableScale onPress={onPress}>
                <View style={styles.navItem}>
                    <View style={styles.navLeft}>
                        <View style={[styles.iconBox, { backgroundColor: type === 'destructive' ? 'rgba(239, 68, 68, 0.1)' : theme.colors.secondary }]}>
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
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Name</Text>
                    <Card style={styles.sectionCard}>
                        <View style={styles.navItem}>
                            <View style={styles.navLeft}>
                                <View style={[styles.iconBox, { backgroundColor: theme.colors.secondary }]}>
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
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Theme</Text>
                    <Card style={[styles.sectionCard, { padding: theme.spacing.md, paddingVertical: theme.spacing.lg }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {Object.entries(themes).map(([key, t]) => {
                                const isSelected = themeName === key;
                                return (
                                    <PressableScale
                                        key={key}
                                        onPress={() => setThemeName(key)}
                                        style={{ alignItems: 'center', marginRight: 16 }}
                                    >
                                        <View style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 24,
                                            backgroundColor: t.colors.background,
                                            borderWidth: 3,
                                            borderColor: isSelected ? t.colors.primary : t.colors.border,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 8,
                                        }}>
                                            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: t.colors.primary }} />
                                        </View>
                                        <Text variant="caption" style={{
                                            color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                                            fontFamily: isSelected ? theme.typography.fontFamily.bold : theme.typography.fontFamily.medium
                                        }}>
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </Text>
                                    </PressableScale>
                                );
                            })}
                        </ScrollView>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Your Financial Pet</Text>
                    <View style={{ paddingVertical: theme.spacing.md }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {AVATARS.map((avatar) => {
                                const isSelected = avatarId === avatar.id || (!avatarId && avatar.id === 'owl');
                                return (
                                    <PressableScale
                                        key={avatar.id}
                                        onPress={() => setAvatarId(avatar.id)}
                                        style={styles.avatarOption}
                                    >
                                        <View style={[
                                            styles.avatarImageContainer,
                                            { borderColor: isSelected ? theme.colors.primary : 'transparent' }
                                        ]}>
                                            <Image source={avatar.image} style={styles.avatarImage} />
                                        </View>
                                        <Text
                                            variant="caption"
                                            style={{
                                                color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                                                textAlign: 'center',
                                                fontFamily: isSelected ? theme.typography.fontFamily.bold : theme.typography.fontFamily.medium
                                            }}
                                        >
                                            {avatar.name}
                                        </Text>
                                    </PressableScale>
                                );
                            })}
                        </ScrollView>
                        {avatarId && (
                            <Text variant="caption" color="textSecondary" style={{ marginTop: 16, textAlign: 'center', paddingHorizontal: 20 }}>
                                {AVATARS.find(a => a.id === avatarId)?.description}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Security</Text>
                    <Card style={styles.sectionCard}>
                        <View style={styles.navItem}>
                            <View style={styles.navLeft}>
                                <View style={[styles.iconBox, { backgroundColor: theme.colors.secondary }]}>
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
                            label="My Spending Plan"
                            value={currencyCode}
                            onPress={() => router.push('/configuration')}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>Export Data</Text>
                    <Card style={styles.sectionCard}>
                        <PressableScale onPress={handleExportExcel}>
                            <View style={styles.navItem}>
                                <View style={styles.navLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: 'transparent' }]}>
                                        <Image 
                                            source={{ uri: 'https://img.icons8.com/color/48/microsoft-excel-2019--v1.png' }} 
                                            style={{ width: 24, height: 24 }} 
                                        />
                                    </View>
                                    <Text variant="body" style={styles.navLabel}>Export as Excel</Text>
                                </View>
                                <View style={styles.navRight}>
                                    <ChevronRight size={18} color={theme.colors.textSecondary} />
                                </View>
                            </View>
                        </PressableScale>
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
                        <NavItem icon={Info} label="Version" value="1.0.0" type="text" onPress={() => { }} />
                    </Card>
                </View>

                <View style={styles.footer}>
                    <Text variant="caption" color="textSecondary" style={styles.footerText}>
                        Fraction
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
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
        borderTopRightRadius: 4,
    },
    avatarOption: {
        alignItems: 'center',
        marginRight: 16,
        width: 80,
    },
    avatarImageContainer: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 3,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
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
