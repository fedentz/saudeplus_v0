import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { registerWithEmail } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../hooks/useUser';

export default function Register() {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const { theme: mode } = useTheme();
  const { user } = useUser();
  const styles = createStyles(theme, mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }, [user]);

  const handleRegister = async () => {
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
      await registerWithEmail(email, password);
      Alert.alert('Cuenta creada', 'Ya podés iniciar sesión');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.loginLink}>¿Ya tenés cuenta? Iniciar sesión</Text>
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
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      color: theme.colors.primary,
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
    button: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 6,
    },
    buttonText: {
      color: theme.colors.white,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    loginLink: {
      textAlign: 'center',
      color: theme.colors.primary,
      marginTop: 20,
    },
    error: { color: 'red', marginBottom: 10 },
  });
