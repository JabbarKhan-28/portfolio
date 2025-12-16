
import CustomAlertModal, { AlertType } from '@/components/CustomAlertModal';
import { COLORS } from '@/constants/theme';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AddBlogModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddBlogModal({ visible, onClose }: AddBlogModalProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [mediumLink, setMediumLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom Alert State
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
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleSubmit = async () => {
    if (!title || !summary) {
      showAlert('error', 'Error', 'Please fill in Title and Summary');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'blogs'), {
        title,
        summary,
        mediumLink,
        imageUrl,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setSummary('');
      setMediumLink('');
      setImageUrl('');
      
      showAlert('success', 'Success', 'Blog post added!', () => {
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
            <Text style={styles.title}>Add New <Text style={styles.highlight}>Blog</Text></Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSec} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Blog Title"
                placeholderTextColor={COLORS.textSec}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Summary</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief summary of the article..."
                placeholderTextColor={COLORS.textSec}
                value={summary}
                onChangeText={setSummary}
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
              <Text style={styles.label}>Link (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://medium.com/..."
                placeholderTextColor={COLORS.textSec}
                value={mediumLink}
                onChangeText={setMediumLink}
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
                <Text style={styles.submitButtonText}>Publish Blog</Text>
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
    maxHeight: '80%',
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
    // Removed border
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
