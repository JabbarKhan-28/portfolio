
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import * as Animatable from "react-native-animatable";

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!name || !email || !message) {
      if (Platform.OS === 'web') {
        window.alert("Please fill in all fields");
      } else {
        Alert.alert("Error", "Please fill in all fields");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Use FormSubmit.co to send email without backend
      // Note: First time usage requires confirming the email address
      const response = await fetch("https://formsubmit.co/ajax/jabbar118114@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio Contact from ${name}`,
        })
      });

      const result = await response.json();

      if (response.ok) {
        setModalVisible(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again later.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send message. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrim} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Contact <Text style={styles.purpleText}>Me</Text></Text>
        </View>

        <Text style={styles.subText}>
          Have a project in mind or just want to chat? Send me a message!
        </Text>

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
            style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleSend}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.textPrim} />
            ) : (
                <>
                <Text style={styles.submitButtonText}>Send Message</Text>
                <Ionicons name="send" size={20} color={COLORS.textPrim} />
                </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* STYLISH CUSTOM ALERT MODAL */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={500} style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={60} color={COLORS.purple} />
            </View>
            <Text style={styles.modalTitle}>Message Sent!</Text>
            <Text style={styles.modalMessage}>
              Thanks for reaching out. I'll get back to you as soon as possible.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Awesome</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15
  },
  backButton: {
    padding: 8,
    backgroundColor: COLORS.cardBg,
    borderRadius: 8
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrim,
  },
  purpleText: {
    color: COLORS.purple
  },
  subText: {
    color: COLORS.textSec,
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24
  },
  formContainer: {
    gap: 20
  },
  inputGroup: {
    gap: 8
  },
  label: {
    color: COLORS.textPrim,
    fontSize: 16,
    fontWeight: '600'
  },
  input: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrim,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16
  },
  textArea: {
    minHeight: 120
  },
  submitButton: {
    backgroundColor: COLORS.purple,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    gap: 10
  },
  submitButtonText: {
    color: COLORS.textPrim,
    fontSize: 18,
    fontWeight: 'bold'
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrim,
    marginBottom: 10,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.textSec,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22
  },
  modalButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  modalButtonText: {
    color: COLORS.textPrim,
    fontWeight: 'bold',
    fontSize: 16
  }
});
