import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  Platform,
} from 'react-native';

type Props = {
  visible: boolean;
  summary: string;
  onClose: () => void;
};

export default function ActivitySummaryModal({ visible, summary, onClose }: Props) {
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
            <Text style={styles.title}>Resumen de la actividad:</Text>
            <Text style={styles.text}>{summary}</Text>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>CERRAR</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
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
  },
  text: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00aaff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
