import CustomAlertModal, { AlertType } from '@/components/CustomAlertModal';
import { COLORS } from '@/constants/theme';
import { auth } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: "",
    message: "",
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setAlertConfig({ visible: true, type, title, message, onConfirm });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('error', 'Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Login successful, navigate back
      router.back(); 
    } catch (error: any) {
      console.error(error.code);
      let errorMessage = "An unexpected error occurred.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
         errorMessage = "Invalid Email or Password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
          errorMessage = "The email address is badly formatted.";
      } else {
          errorMessage = error.message;
      }
      // @ts-ignore
      const currentProjectId = auth.app.options.projectId;
      showAlert('error', 'Login Failed', `Code: ${error.code}\nProject: ${currentProjectId}\nMessage: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <style type="text/css">{`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 30px ${COLORS.surface} inset !important;
              -webkit-text-fill-color: ${COLORS.textPrim} !important;
              caret-color: ${COLORS.textPrim};
          }
        `}</style>
      )}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrim} />
      </TouchableOpacity>

      <Text style={styles.title}>Admin <Text style={styles.highlight}>Login</Text></Text>
      
      <View style={styles.form}>
        <View style={[styles.inputContainer, { backgroundColor: COLORS.surface }]}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSec} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSec}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: COLORS.surface }]}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSec} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textSec}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primaryBg} />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    padding: 20,
    paddingBottom:100,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrim,
    marginBottom: 40,
    textAlign: 'center',
  },
  highlight: {
    color: COLORS.purple,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg, // Use theme color
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    // Removed border to fix "white line" issue
    // borderWidth: 1, 
    // borderColor: 'rgba(255, 255, 255, 0.1)', 
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrim,
    fontSize: 16,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
  },
  loginButton: {
    backgroundColor: COLORS.purple,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: COLORS.primaryBg,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
