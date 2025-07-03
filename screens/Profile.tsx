import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import React from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      paddingTop: 40,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    emojiAvatar: { fontSize: 40 },
    email: { fontSize: 20, color: theme.colors.text, marginBottom: 20 },
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
    },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    emojiOption: { width: '25%', alignItems: 'center', marginVertical: 10 },
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const emojis = ['🏃‍♂️', '🏃‍♀️', '🐶', '🐱', '🐢', '🐟', '🦁'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{ gap: 16, alignItems: 'center', paddingVertical: 24 }}>
        <View style={styles.avatar}>
          <Text style={styles.emojiAvatar}>{emoji}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.label}>Escolher emoji de atividade: {emoji}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.emojiGrid}>
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
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

