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
    pdfPath: string; // This is the URL
    date?: string;
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

    // Reset or Populate form when modal opens
    useEffect(() => {
        if (visible) {
            if (blogToEdit) {
                setTitle(blogToEdit.title || '');
                setSummary(blogToEdit.summary || '');
                setPdfUrl(blogToEdit.pdfPath || '');
            } else {
                setTitle('');
                setSummary('');
                setPdfUrl('');
            }
        }
    }, [visible, blogToEdit]);

    const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
        setAlertConfig({ visible: true, type, title, message, onConfirm });
    };

    const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

    const getFormattedDate = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim() || !summary.trim() || !pdfUrl.trim()) {
            showAlert('error', 'Missing Information', 'Please fill in all fields (Title, Summary, and PDF Link) to publish.');
            return;
        }

        if (!URL_REGEX.test(pdfUrl.trim())) {
            showAlert('error', 'Invalid URL', 'The PDF Link provided does not look like a valid URL.');
            return;
        }

        setLoading(true);

        try {
            if (!db) throw new Error("Database connection not initialized.");

            const blogData = {
                title: title.trim(),
                summary: summary.trim(),
                pdfPath: pdfUrl.trim(),
                updatedAt: serverTimestamp(),
            };

            if (blogToEdit) {
                // Update
                const blogRef = doc(db, 'blogs', blogToEdit.id);
                await updateDoc(blogRef, blogData);
            } else {
                // Create
                await addDoc(collection(db, 'blogs'), {
                    ...blogData,
                    date: getFormattedDate(), // Keep string date for display as per design
                    createdAt: serverTimestamp(),
                });
            }

            // Success
            if (onSuccess) onSuccess();
            onClose();

        } catch (error: any) {
            console.error("Blog Save Error:", error);
            showAlert('error', 'Publishing Failed', error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {blogToEdit ? "Edit" : "New"} <Text style={styles.highlight}>Blog</Text>
                        </Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                            <Ionicons name="close" size={24} color={COLORS.textSec} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter blog title..."
                                placeholderTextColor={COLORS.textSec}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Summary</Text>
                            <TextInput
                                style={StyleSheet.flatten([styles.input, styles.textArea])}
                                placeholder="What is this blog about?"
                                placeholderTextColor={COLORS.textSec}
                                value={summary}
                                onChangeText={setSummary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PDF Document Link</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://example.com/my-blog.pdf"
                                placeholderTextColor={COLORS.textSec}
                                value={pdfUrl}
                                onChangeText={setPdfUrl}
                                autoCapitalize="none"
                                keyboardType="url"
                                autoCorrect={false}
                            />
                        </View>

                        <TouchableOpacity
                            style={StyleSheet.flatten([
                                styles.submitButton,
                                (loading || !title || !summary || !pdfUrl) && { opacity: 0.6 }
                            ])}
                            onPress={handleSubmit}
                            disabled={loading}
                        >

                            {loading ? (
                                <ActivityIndicator color="#FFF" />
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
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.8)', 
        justifyContent: 'center', 
        padding: 20 
    },
    container: { 
        backgroundColor: COLORS.primaryBg, 
        borderRadius: 20, 
        maxHeight: '85%', 
        borderWidth: 1, 
        borderColor: COLORS.border,
        overflow: 'hidden',
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center'
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 20, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.border 
    },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrim },
    highlight: { color: COLORS.purple },
    form: { padding: 20, gap: 16 },
    inputGroup: { gap: 8 },
    label: { color: COLORS.textSec, fontSize: 13, marginLeft: 4, fontWeight: '600' },
    input: { 
        backgroundColor: COLORS.cardBg, 
        borderRadius: 12, 
        padding: 14, 
        color: COLORS.textPrim, 
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    textArea: { height: 100 },
    submitButton: { 
        backgroundColor: COLORS.purple, 
        paddingVertical: 14, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginTop: 10,
        elevation: 2
    },
    submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
