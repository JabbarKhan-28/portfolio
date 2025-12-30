import { EMAIL_REGEX } from "@/constants/regex";
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
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
} from "react-native";


import * as Animatable from "react-native-animatable";

import emailjs from '@emailjs/browser';

// ---------------- EMAILJS VALIDATION ----------------
// PLEASE FILL THESE WITH YOUR EMAILJS CREDENTIALS
const EMAILJS_SERVICE_ID = "service_ytxjbl4";
const EMAILJS_TEMPLATE_ID = "template_u7hpd38";
const EMAILJS_PUBLIC_KEY = "70UUo9eMlSEZH2fE0";

export default function ContactScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

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

    if (!EMAIL_REGEX.test(email)) {
      showStatus(
        "error",
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }



    setIsSubmitting(true);

    try {
      const templateParams = {
          name, // Matches {{name}} in your template
          email, // Matches {{email}} in your template
          from_name: name,
          from_email: email,
          message,
          to_name: "Jabbar Khan"
      };

      await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
      );

      showStatus(
        "success",
        "Message Sent!",
        "Thanks for reaching out. I'll get back to you as soon as possible."
      );
      setName("");
      setEmail("");
      setMessage("");

    } catch (error: any) {
      console.error("EmailJS Error:", error);
      const errorMessage = error?.text || error?.message || "Could not send message. Please check your connection.";
      showStatus(
        "error",
        "Sending Failed",
        `Error: ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryBg }}>
      {/* Background Glows */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
              <Text style={[styles.headerText, isWeb && styles.webHeader]}>
                Let's <Text style={styles.purpleText}>Design</Text> Something Amazing
              </Text>
              <View style={styles.headerDivider} />
              <Text style={styles.subText}>
                Whether it's a new project or just a quick brainstorm, I'm always open to talking tech.
              </Text>
            </View>
          </View>

          {/* FORM */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={800} 
            style={StyleSheet.flatten([styles.formContainer, { padding: width < 450 ? 20 : 40 }])}
          >



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
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
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
                <ActivityIndicator color={COLORS.primaryBg} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Message</Text>
                  <Ionicons
                    name="send"
                    size={20}
                    color={COLORS.primaryBg}
                  />
                </>
              )}
            </TouchableOpacity>
          </Animatable.View>
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
                      ? COLORS.success
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
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -100, // Shift to Left for variety
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowPurple,
    opacity: 0.5,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    right: -100, // Shift to Right for variety
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowCyan,
    opacity: 0.3,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 40,
    paddingBottom: 120,



    justifyContent: "center",
  },
  headerWrapper: {
    marginBottom: 50,
    alignItems: "center",
  },
  headerTextContainer: {
    alignItems: "center",
    marginTop: 20,
    width: '100%'
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    fontSize: Platform.OS === 'android' ? 36 : 34,
    fontWeight: "900",
    color: COLORS.textPrim,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: Platform.OS === 'android' ? 42 : 40,
  },
  webHeader: {
      fontSize: 52,
      lineHeight: 58
  },



  purpleText: {
    color: COLORS.textHighlight,
  },
  headerDivider: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.textHighlight,
    borderRadius: 2,
    marginVertical: 20
  },
  subText: {
    color: COLORS.textSec,
    fontSize: Platform.OS === 'android' ? 18 : 16,
    textAlign: "center",
    maxWidth: 500,
    lineHeight: 26
  },


  formContainer: {
    width: "100%",
    alignSelf: "center",
    maxWidth: 600,
    borderRadius: 32,
    // backgroundColor removed
    padding: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 30,


    ...Platform.select({
        web: { 
            backdropFilter: 'blur(15px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        } as any,
        default: {
            elevation: 10,
            shadowColor: COLORS.textHighlight,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20
        }
    })
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    color: COLORS.textPrim,
    fontSize: Platform.OS === 'android' ? 14 : 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginLeft: 4,
    opacity: 0.8
  },



  input: {
    backgroundColor: COLORS.darkBg,
    color: COLORS.textPrim,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    fontSize: 16,
    fontWeight: '500'
  },


  textArea: {
    minHeight: 160,
  },
  submitButton: {
    backgroundColor: COLORS.textHighlight,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    marginTop: 10,
    elevation: 8,
    shadowColor: COLORS.textHighlight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  submitButtonText: {
    color: COLORS.primaryBg,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 0, 31, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: 30,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(213, 0, 249, 0.1)',
    padding: 20,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrim,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.textSec,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  modalButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    backgroundColor: COLORS.textHighlight,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: COLORS.primaryBg,
    fontSize: 18,
    fontWeight: "900",
  },
});
