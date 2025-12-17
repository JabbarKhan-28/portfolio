import CustomAlertModal, { AlertType } from '@/components/CustomAlertModal';
import { COLORS } from '@/constants/theme';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddProjectModal({ visible, onClose, onSuccess }: AddProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ghLink, setGhLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Changed to store URL string directly
  const [loading, setLoading] = useState(false);

  /* State Reset on Open */
  React.useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setGhLink('');
      setDemoLink('');
      setImageUrl('');
      setLoading(false);
    }
  }, [visible]);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: AlertType;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({ visible: true, type, title, message, onConfirm });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      showAlert('error', 'Missing Fields', 'Title and Description are required.');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'projects'), {
        title,
        description,
        ghLink,
        demoLink,
        imageUrl, // Store the manually entered URL
        createdAt: serverTimestamp(),
      });

      // Reset Form
      setTitle('');
      setDescription('');
      setGhLink('');
      setDemoLink('');
      setImageUrl('');

      // Close and Success
      setLoading(false);
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error adding project:', error);
      setLoading(false);
      showAlert('error', 'Submission Failed', error.message || 'Could not add project.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Add <Text style={styles.highlight}>Project</Text>
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSec} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Project Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Awesome App"
                placeholderTextColor={COLORS.textSec}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What does this project do?"
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
                placeholder="https://example.com/image.png"
                placeholderTextColor={COLORS.textSec}
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>GitHub Link (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://github.com/..."
                placeholderTextColor={COLORS.textSec}
                value={ghLink}
                onChangeText={setGhLink}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Demo Link (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://my-app.com"
                placeholderTextColor={COLORS.textSec}
                value={demoLink}
                onChangeText={setDemoLink}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.primaryBg} />
              ) : (
                <Text style={styles.submitButtonText}>Publish Project</Text>
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: COLORS.primaryBg,
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
    gap: 15,
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    backgroundColor: COLORS.darkPurple,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: COLORS.primaryBg,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
