import React from 'react';
import { Text, View } from 'react-native';
import { Button, styles } from '../components/UI';
import { useApp } from '../context/AppContext';
export function SettingsScreen() { const { language, setLanguage, online, pendingChanges, syncError, t } = useApp(); return <View style={styles.page}><Text style={styles.label}>{t('language')}</Text><Button title={`${language === 'en' ? '✓ ' : ''}${t('english')}`} type="neutral" onPress={() => setLanguage('en')} /><Button title={`${language === 'vi' ? '✓ ' : ''}${t('vietnamese')}`} type="neutral" onPress={() => setLanguage('vi')} /><View style={[styles.card, { marginTop: 20 }]}><Text style={styles.title}>{online && !pendingChanges.length ? t('synced') : t('offline')}</Text><Text style={styles.sub}>{pendingChanges.length} {t('pendingChanges')}</Text>{syncError ? <Text style={[styles.error, { marginTop: 8 }]}>{t('syncProblem')}: {syncError}</Text> : null}</View></View>; }
