
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!name || !email || !message) {
      if (Platform.OS === 'web') {
        window.alert("Please fill in all fields");
      } else {
        Alert.alert("Error", "Please fill in all fields");
      }
      return;
    }

    // Construct mailto link
    const subject = `Portfolio Contact from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoUrl = `mailto:jabbarkhan118114@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl);
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

          <TouchableOpacity style={styles.submitButton} onPress={handleSend}>
            <Text style={styles.submitButtonText}>Send Message</Text>
            <Ionicons name="send" size={20} color={COLORS.textPrim} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40
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
  }
});
