import CustomAlertModal, { AlertType } from "@/components/modals/CustomAlertModal";
import { EMAIL_REGEX } from "@/constants/regex";
import { COLORS } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as Animatable from "react-native-animatable";

interface AddSubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddSubscriberModal({
  visible,
  onClose,
  onSuccess,
}: AddSubscriberModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
  }>({ visible: false, type: "info", title: "", message: "" });

  const handleAdd = async () => {
    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      setAlertConfig({
        visible: true,
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "subscribers"), {
        email: email.trim(),
        createdAt: serverTimestamp(),
        source: "admin-dashboard",
      });
      setLoading(false);
      setEmail("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      setLoading(false);
      setAlertConfig({
        visible: true,
        type: "error",
        title: "Error",
        message: error.message || "Failed to add subscriber.",
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animatable.View animation="zoomIn" duration={300} style={styles.container}>
             {Platform.OS !== 'web' && (
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
             )}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <View style={styles.iconContainer}>
                    <Ionicons name="person-add-outline" size={24} color={COLORS.textHighlight} />
                 </View>
                 <Text style={styles.title}>Add Subscriber</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSec} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAdd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitText}>Add User</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animatable.View>
        
        <CustomAlertModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(30, 30, 40, 0.4)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: 'hidden',
    ...Platform.select({
        web: {
            backdropFilter: 'blur(30px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        } as any,
    })
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrim,
    marginLeft: 12,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  label: {
    color: COLORS.textSec,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 14,
    color: COLORS.textPrim,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  cancelText: {
    color: COLORS.textSec,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: COLORS.textHighlight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  submitText: {
    color: COLORS.primaryBg,
    fontWeight: "bold",
  },
});
