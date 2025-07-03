import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    logoutButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 6,
    },
    logoutText: { color: theme.colors.white, fontWeight: 'bold' },
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); // o navigation.navigate si preferís
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

