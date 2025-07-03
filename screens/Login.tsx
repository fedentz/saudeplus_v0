import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { loginWithEmail } from '../services/authService';
import { useGoogleAuth } from '../firebase/googleAuth';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../hooks/useUser';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { promptAsync } = useGoogleAuth();
  const theme = useAppTheme();
  const { theme: mode } = useTheme();
  const { user } = useUser();
  const styles = createStyles(theme, mode);

  useEffect(() => {
    if (user) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }, [user]);

  const handleLogin = async () => {
    const emailRegex = /.+@.+\..+/;
    let valid = true;
    if (!emailRegex.test(email)) {
      setEmailError('Formato de email inválido');
      valid = false;
    } else setEmailError('');
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      valid = false;
    } else setPasswordError('');
    if (!valid) return;

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>Saúde+</Text>
      <Text style={styles.subtitle}>Inicia sesión para comenzar</Text>

      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor={mode === 'dark' ? '#aaa' : '#666'}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
      <TextInput
        placeholder="Contraseña"
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
          <Text style={styles.loginText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
        <Text style={styles.googleText}>Continuar con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>¿No tienes cuenta? Crear una</Text>
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
    googleButton: {
      borderColor: '#DB4437',
      borderWidth: 1,
      padding: 15,
      borderRadius: 6,
      marginBottom: 20,
    },
    googleText: {
      color: '#DB4437',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    registerLink: {
      textAlign: 'center',
      color: theme.colors.primary,
      marginTop: 20,
    },
  });
