import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { loginWithEmail } from '../services/authService';
import { useGoogleAuth } from '../firebase/googleAuth';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { promptAsync } = useGoogleAuth();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const handleLogin = async () => {
    try {
      await loginWithEmail(email, password);
      navigation.replace('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Saúde+</Text>
      <Text style={styles.subtitle}>Inicia sesión para comenzar</Text>

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
        <Text style={styles.googleText}>Continuar con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>¿No tienes cuenta? Crear una</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: any) =>
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
      backgroundColor: theme.colors.white,
    },
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
