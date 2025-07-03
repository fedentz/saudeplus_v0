import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  Button,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';

type Props = {
  visible: boolean;
  summary: string;
  onClose: () => void;
};

export default function ActivitySummaryModal({ visible, summary, onClose }: Props) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose} // necesario en Android para botón físico "back"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Resumo da atividade:</Text>
            <Text style={styles.text}>{summary}</Text>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>FECHAR</Text>
            </TouchableOpacity>
            <Button
              title="Voltar ao início"
              onPress={() =>
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
              }
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
    modalContainer: {
      backgroundColor:
        theme.colors.white === '#000000' ? '#1e1e1e' : '#fff',
      borderRadius: 16,
      padding: 20,
    elevation: 6,
    shadowColor: theme.colors.text,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    maxHeight: '80%',
  },
  container: {
    alignItems: 'center',
  },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
      color: theme.colors.white === '#000000' ? '#fff' : '#000',
    },
    text: {
      fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
      textAlign: 'center',
      marginBottom: 20,
      color: theme.colors.white === '#000000' ? '#ccc' : '#444',
    },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
});
