import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { loginWithEmail } from '../services/authService';
import { auth } from '../firebase/firebase';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../hooks/useUser';
import { useTranslation } from 'react-i18next';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useAppTheme();
  const { theme: mode } = useTheme();
  const { user } = useUser();
  const { t } = useTranslation();
  const styles = createStyles(theme, mode);

  useEffect(() => {
    if (user) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('login.fillAll'));
      return;
    }

    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      setEmailError(t('login.invalidEmail'));
      return;
    }
    setEmailError('');

    if (password.length < 6) {
      setPasswordError(t('login.minLength'));
      return;
    }
    setPasswordError('');

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      navigation.replace('MainTabs');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert(t('login.userNotFound'));
      } else {
        Alert.alert(t('login.loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>{t('login.title')}</Text>
      <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

      <TextInput
        placeholder={t('login.email')}
        placeholderTextColor={mode === 'dark' ? '#aaa' : '#666'}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
      <TextInput
        placeholder={t('login.password')}
        placeholderTextColor={mode === 'dark' ? '#aaa' : '#666'}
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.loginText}>{t('login.enter')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>{t('login.registerLink')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, mode: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      paddingTop: 40,
      backgroundColor: theme.colors.background,
    },
    logo: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 30,
      color: theme.colors.darkGray,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.gray,
      borderRadius: 6,
      padding: 12,
      marginBottom: 15,
      backgroundColor: mode === 'dark' ? '#1e1e1e' : theme.colors.white,
      color: mode === 'dark' ? '#fff' : '#000',
    },
    error: { color: 'red', marginBottom: 10 },
    loginButton: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 6,
      marginBottom: 10,
    },
    loginText: {
      color: theme.colors.white,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    registerLink: {
      textAlign: 'center',
      color: theme.colors.primary,
      marginTop: 20,
    },
  });
