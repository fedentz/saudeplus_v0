import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { useAppTheme } from '../hooks/useAppTheme';
import { useTheme } from '../context/ThemeContext';

export default function ChangePassword({ navigation }: any) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const theme = useAppTheme();
  const { theme: mode } = useTheme();
  const styles = createStyles(theme, mode);

  const handleSave = async () => {
    setError('');
    if (!current || !newPass || !repeat) {
      setError('Completa todos los campos');
      return;
    }
    if (newPass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPass !== repeat) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const user = getAuth().currentUser;
      if (!user || !user.email) throw new Error('Usuario no autenticado');
      const cred = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPass);
      Alert.alert('Éxito', 'Contraseña actualizada');
      navigation.goBack();
    } catch (e: any) {
      setError(e.message || 'Error al actualizar');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Contraseña actual"
        secureTextEntry
        placeholderTextColor={mode === 'dark' ? '#aaa' : '#666'}
        style={styles.input}
        value={current}
        onChangeText={setCurrent}
      />
      <TextInput
        placeholder="Nueva contraseña"
        secureTextEntry
        placeholderTextColor={mode === 'dark' ? '#aaa' : '#666'}
        style={styles.input}
        value={newPass}
        onChangeText={setNewPass}
      />
      <TextInput
        placeholder="Repetir nueva contraseña"
        secureTextEntry
        placeholderTextColor={mode === 'dark' ? '#aaa' : '#666'}
        style={styles.input}
        value={repeat}
        onChangeText={setRepeat}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, mode: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.gray,
      borderRadius: 6,
      padding: 12,
      marginBottom: 15,
      color: mode === 'dark' ? '#fff' : '#000',
      backgroundColor: mode === 'dark' ? '#1e1e1e' : theme.colors.white,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 6,
      marginTop: 10,
    },
    buttonText: {
      color: theme.colors.white,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    error: { color: 'red', textAlign: 'center', marginBottom: 10 },
  });
