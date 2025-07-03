import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../hooks/useUser';
import { useEmoji } from '../context/EmojiContext';

export default function Profile() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const { emoji, setEmoji } = useEmoji();
  const theme = useAppTheme();
  const [modalVisible, setModalVisible] = React.useState(false);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      width: '100%',
      alignItems: 'flex-end',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.gray,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 20,
    },
    name: { fontSize: 20, color: theme.colors.text, marginBottom: 4 },
    email: { color: theme.colors.darkGray, marginBottom: 10 },
    label: { color: theme.colors.text },
    logoutButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 6,
    },
    logoutText: { color: theme.colors.white, fontWeight: 'bold' },
    emojiButton: { marginTop: 20 },
    emoji: { fontSize: 40 },
    modalBg: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      padding: 20,
      borderRadius: 8,
      flexDirection: 'row',
    },
    emojiOption: { marginHorizontal: 10 },
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const emojis = ['🏃‍♂️', '🚴‍♀️', '🏊‍♂️', '🤸‍♂️', '🏋️‍♂️'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatar}>
        <Ionicons name="person" size={40} color={theme.colors.white} />
      </View>
      <Text style={styles.name}>{user?.displayName || 'Usuario'}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity
        style={styles.emojiButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.label}>Elegir emoji de actividad: {emoji}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {emojis.map((e) => (
              <TouchableOpacity
                key={e}
                style={styles.emojiOption}
                onPress={() => {
                  setEmoji(e);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

