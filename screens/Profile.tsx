import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); // o navigation.navigate si preferís
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Button title="Cerrar sesión" onPress={handleLogout} />
  );
}
