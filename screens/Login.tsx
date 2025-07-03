import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { RootStackParamList } from '../App';
import { loginWithEmail } from '../services/authService';
import { useGoogleAuth } from '../firebase/googleAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { promptAsync } = useGoogleAuth();

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

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#00AEEF', textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 30, color: '#555' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#00AEEF', padding: 15, borderRadius: 5, marginBottom: 10,
  },
  loginText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  googleButton: {
    borderColor: '#DB4437', borderWidth: 1, padding: 15, borderRadius: 5,
    marginBottom: 20,
  },
  googleText: { color: '#DB4437', textAlign: 'center', fontWeight: 'bold' },
  registerLink: { textAlign: 'center', color: '#00AEEF', marginTop: 20 },
});
