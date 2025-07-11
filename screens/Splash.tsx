import React, { useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUser } from '../hooks/useUser';
import { isAdminUser } from '../services/userService';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { user, authInitialized } = useUser();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  useEffect(() => {
    const checkRoleAndNavigate = async () => {
      if (!authInitialized) return;
      if (user) {
        try {
          const admin = await isAdminUser(user);
          if (admin) {
            console.log('SplashScreen: redirigiendo a AdminPanel');
            navigation.reset({ index: 0, routes: [{ name: 'AdminPanel' }] });
          } else {
            console.log('SplashScreen: redirigiendo a Home');
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          }
        } catch (err) {
          console.log('SplashScreen: error obteniendo custom claims', err);
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
      }
    };
    checkRoleAndNavigate();
  }, [user, authInitialized]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('splash.title')}</Text>
      <Text style={styles.subtitle}>{t('splash.subtitle')}</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.primaryButtonText}>{t('splash.createAccount')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.secondaryButtonText}>{t('splash.haveAccount')}</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>{t('splash.footer')}</Text>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    title: {
      fontSize: 40,
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.darkGray,
      marginBottom: 40,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 6,
      marginBottom: 15,
    },
    primaryButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryButton: {
      borderColor: theme.colors.primary,
      borderWidth: 1.5,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 6,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    footer: {
      position: 'absolute',
      bottom: 20,
      fontSize: 12,
      color: theme.colors.darkGray,
    },
  });
