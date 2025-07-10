import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const navigation = useNavigation<any>();
  const { theme, toggleTheme } = useTheme();
  const appTheme = useAppTheme();
  const { t } = useTranslation();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: appTheme.colors.background,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderColor: appTheme.colors.gray,
    },
    label: { color: appTheme.colors.text, fontSize: 16 },
    link: { color: appTheme.colors.primary, fontSize: 16 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme === 'dark' ? '#fff' : '#000',
          }}
        >
          {t('settings.title')}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.label}>{t('settings.darkMode')}</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
      </View>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('ChangePassword')}
      >
        <Text style={styles.link}>{t('settings.changePassword')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
