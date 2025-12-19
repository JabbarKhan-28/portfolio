import CustomAlertModal, { AlertType } from '@/components/CustomAlertModal';
import { URL_REGEX } from '@/constants/regex';
import { COLORS } from '@/constants/theme';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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

export interface BlogPost {
    id: string;
    title: string;
    summary: string;
    pdfPath: string;
    date?: string;
    // ... any other fields
}

interface AddBlogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  blogToEdit?: BlogPost | null;
}

export default function AddBlogModal({ visible, onClose, onSuccess, blogToEdit }: AddBlogModalProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (visible) {
          if (blogToEdit) {
              setTitle(blogToEdit.title);
              setSummary(blogToEdit.summary);
              setPdfUrl(blogToEdit.pdfPath);
          } else {
              setTitle('');
              setSummary('');
              setPdfUrl('');
          }
      }
  }, [visible, blogToEdit]);

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

  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const handleSubmit = async () => {
    if (!title || !summary || !pdfUrl) {
      showAlert('error', 'Error', 'Please fill all fields');
      return;
    }

    if (!URL_REGEX.test(pdfUrl)) {
      showAlert('error', 'Invalid URL', 'Please enter a valid URL.');
      return;
    }

    setLoading(true);

    try {
      if (blogToEdit) {
          // Update existing
          await updateDoc(doc(db, 'blogs', blogToEdit.id), {
              title,
              summary,
              pdfPath: pdfUrl,
              updatedAt: serverTimestamp(),
          });
      } else {
          // Create new
          await addDoc(collection(db, 'blogs'), {
            title,
            summary,
            pdfPath: pdfUrl,
            createdAt: serverTimestamp(),
          });
      }

      setTitle('');
      setSummary('');
      setPdfUrl('');

      onClose();

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Firebase Details:', error);
      showAlert(
        'error',
        'Failed',
        `Code: ${error?.code || 'N/A'}\nMessage: ${error?.message || error}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {blogToEdit ? "Edit" : "Add New"} <Text style={styles.highlight}>Blog</Text>
            </Text>
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
              <Text style={styles.label}>Link URL (PDF/HTML)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/document.pdf"
                placeholderTextColor={COLORS.textSec}
                value={pdfUrl}
                onChangeText={setPdfUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || !title || !summary || !pdfUrl) && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={loading || !title || !summary || !pdfUrl}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.primaryBg} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {blogToEdit ? "Update Blog" : "Publish Blog"}
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: COLORS.primaryBg, borderRadius: 20, maxHeight: '80%', borderWidth: 1, borderColor: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrim },
  highlight: { color: COLORS.purple },
  form: { padding: 20, gap: 20 },
  inputGroup: { gap: 8 },
  label: { color: COLORS.textSec, fontSize: 14, marginLeft: 4 },
  input: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 15, color: COLORS.textPrim, fontSize: 16 },
  textArea: { height: 100 },
  submitButton: { backgroundColor: COLORS.darkPurple, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: COLORS.primaryBg, fontSize: 18, fontWeight: 'bold' },
});
