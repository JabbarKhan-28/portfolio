import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import * as Animatable from "react-native-animatable";

export default function ContactScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: "success", // success | error
    title: "",
    message: "",
  });

  const showStatus = (type: string, title: string, message: string) => {
    setStatusModal({
      visible: true,
      type,
      title,
      message,
    });
  };

  const closeStatus = () => {
    setStatusModal((prev) => ({ ...prev, visible: false }));
  };

  const handleSend = async () => {
    if (!name || !email || !message) {
      showStatus(
        "error",
        "Missing Fields",
        "Please fill in all fields before sending."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);
      formData.append("_subject", `Portfolio Contact from ${name}`);

      const response = await fetch(
        "https://formsubmit.co/ajax/jabbar118114@gmail.com",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success === "true") {
        showStatus(
          "success",
          "Message Sent!",
          "Thanks for reaching out. I'll get back to you as soon as possible."
        );
        setName("");
        setEmail("");
        setMessage("");
      } else {
        showStatus(
          "error",
          "Oops!",
          "Something went wrong. Please try again later."
        );
      }
    } catch (error) {
      showStatus(
        "error",
        "Network Error",
        "Failed to send message. Please check your internet connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryBg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.headerWrapper}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrim}
              />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>
                Contact <Text style={styles.purpleText}>Me</Text>
              </Text>
              <Text style={styles.subText}>
                Have a project in mind or just want to chat? Send me a message!
              </Text>
            </View>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor={COLORS.textSec}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Your Email"
                placeholderTextColor={COLORS.textSec}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your message here..."
                placeholderTextColor={COLORS.textSec}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={handleSend}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.textPrim} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Message</Text>
                  <Ionicons
                    name="send"
                    size={20}
                    color={COLORS.textPrim}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* STATUS MODAL */}
        <Modal transparent visible={statusModal.visible} animationType="fade">
          <View style={styles.modalOverlay}>
            <Animatable.View
              animation="zoomIn"
              duration={500}
              style={[
                styles.modalContent,
                statusModal.type === "error" && {
                  borderColor: COLORS.error,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  statusModal.type === "error" && {
                    backgroundColor: "rgba(248,113,113,0.1)",
                  },
                ]}
              >
                <Ionicons
                  name={
                    statusModal.type === "success"
                      ? "checkmark-circle"
                      : "alert-circle"
                  }
                  size={60}
                  color={
                    statusModal.type === "success"
                      ? COLORS.purple
                      : COLORS.error
                  }
                />
              </View>

              <Text style={styles.modalTitle}>{statusModal.title}</Text>
              <Text style={styles.modalMessage}>
                {statusModal.message}
              </Text>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  statusModal.type === "error" && {
                    backgroundColor: COLORS.error,
                  },
                ]}
                onPress={closeStatus}
              >
                <Text style={styles.modalButtonText}>
                  {statusModal.type === "success"
                    ? "Awesome"
                    : "Okay, Got it"}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
    paddingBottom: 100,
    justifyContent: "center",
    backgroundColor: COLORS.primaryBg,
  },
  headerWrapper: {
    marginBottom: 40,
    flexDirection: "column",
    alignItems: "center",
  },
  headerTextContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textPrim,
    textAlign: "center",
  },
  purpleText: {
    color: COLORS.purple,
  },
  subText: {
    color: COLORS.textSec,
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  formContainer: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    color: COLORS.textPrim,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrim,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  textArea: {
    minHeight: 140,
  },
  submitButton: {
    backgroundColor: COLORS.purple,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  submitButtonText: {
    color: COLORS.textPrim,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 30,
    padding: 40,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: "rgba(110,84,255,0.1)",
    padding: 20,
    borderRadius: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrim,
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.textSec,
    textAlign: "center",
    marginBottom: 30,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    backgroundColor: COLORS.purple,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: COLORS.textPrim,
    fontSize: 16,
    fontWeight: "600",
  },
});
