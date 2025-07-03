import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { registerWithEmail } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

export default function Register() {
  const navigation = useNavigation();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await registerWithEmail(email, password);
      Alert.alert('Cuenta creada', 'Ya podés iniciar sesión');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.loginLink}>¿Ya tenés cuenta? Iniciar sesión</Text>
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
      backgroundColor: theme.colors.white,
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
  });
