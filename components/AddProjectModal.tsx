
import CustomAlertModal, { AlertType } from '@/components/CustomAlertModal';
import { COLORS } from '@/constants/theme';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddProjectModal({ visible, onClose }: AddProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ghLink, setGhLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({ visible: true, type, title, message, onConfirm });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      showAlert('error', 'Error', 'Please fill in Title and Description');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'projects'), {
        title,
        description,
        ghLink,
        demoLink,
        imageUrl,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setDescription('');
      setGhLink('');
      setDemoLink('');
      setImageUrl('');
      onClose();
      
      showAlert('success', 'Success', 'Project added!', () => {
          hideAlert();
          onClose();
      });

    } catch (error: any) {
      showAlert('error', 'Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New <Text style={styles.highlight}>Project</Text></Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSec} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Project Title"
                placeholderTextColor={COLORS.textSec}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Project Description..."
                placeholderTextColor={COLORS.textSec}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

             <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={COLORS.textSec}
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>GitHub Link</Text>
              <TextInput
                style={styles.input}
                placeholder="https://github.com/..."
                placeholderTextColor={COLORS.textSec}
                value={ghLink}
                onChangeText={setGhLink}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Demo Link (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor={COLORS.textSec}
                value={demoLink}
                onChangeText={setDemoLink}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.primaryBg} />
              ) : (
                <Text style={styles.submitButtonText}>Add Project</Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          <CustomAlertModal
            visible={alertConfig.visible}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
            onClose={hideAlert}
            onConfirm={alertConfig.onConfirm}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrim,
  },
  highlight: {
    color: COLORS.purple,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.textSec,
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 15,
    color: COLORS.textPrim,
    fontSize: 16,
    // Removed border to match login styling
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    backgroundColor: COLORS.purple,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: COLORS.primaryBg,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
