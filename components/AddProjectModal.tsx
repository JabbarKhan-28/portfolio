import CustomAlertModal, { AlertType } from '@/components/CustomAlertModal';
import { URL_REGEX } from '@/constants/regex';
import { COLORS } from '@/constants/theme';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
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

export interface Project {
  id: string;
  title: string;
  description: string;
  ghLink: string;
  demoLink: string;
  imageUrl?: string;
}

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectToEdit?: Project | null;
}

export default function AddProjectModal({ visible, onClose, onSuccess, projectToEdit }: AddProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ghLink, setGhLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [loading, setLoading] = useState(false);

  /* State Reset on Open */
  React.useEffect(() => {
    if (visible) {
      if (projectToEdit) {
          setTitle(projectToEdit.title);
          setDescription(projectToEdit.description);
          setGhLink(projectToEdit.ghLink);
          setDemoLink(projectToEdit.demoLink);
          setImageUrl(projectToEdit.imageUrl || '');
      } else {
          setTitle('');
          setDescription('');
          setGhLink('');
          setDemoLink('');
          setImageUrl('');
      }
      setLoading(false);
    }
  }, [visible, projectToEdit]);

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

    if ((imageUrl && !URL_REGEX.test(imageUrl)) || 
        (ghLink && !URL_REGEX.test(ghLink)) || 
        (demoLink && !URL_REGEX.test(demoLink))) {
      showAlert('error', 'Invalid URL', 'Please enter valid URLs (starting with http/https is valid, or just domain.com).');
      return;
    }

    setLoading(true);

    try {
      if (projectToEdit) {
          // Update Existing
          await updateDoc(doc(db, 'projects', projectToEdit.id), {
              title,
              description,
              ghLink,
              demoLink,
              imageUrl,
              updatedAt: serverTimestamp(),
          });
      } else {
          // Add New
          await addDoc(collection(db, 'projects'), {
            title,
            description,
            ghLink,
            demoLink,
            imageUrl, 
            createdAt: serverTimestamp(),
          });
      }

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
      console.error('Error adding/updating project:', error);
      setLoading(false);
      showAlert('error', 'Submission Failed', error.message || 'Could not save project.');
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
              {projectToEdit ? "Edit" : "Add"} <Text style={styles.highlight}>Project</Text>
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
                <Text style={styles.submitButtonText}>
                  {projectToEdit ? "Save Changes" : "Publish Project"}
                </Text>
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
    paddingVertical: 14,
    paddingHorizontal: 20,
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
