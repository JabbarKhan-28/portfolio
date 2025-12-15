import { COLORS } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// We'll trust that the user puts the PDF in a public place or we link to a hosted version
// For now, we will use a placeholder link or the asset if we can resolve it
const RESUME_URL = "https://github.com/JabbarKhan-28/Portfolio/raw/main/src/Assets/Jabbar_khan_resume.pdf"; // Best guess or use local asset

export default function ResumeScreen() {
  const handleDownload = () => {
    Linking.openURL(RESUME_URL);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.headerContainer}>
             <Text style={styles.headerText}>My <Text style={styles.purpleText}>Resume</Text></Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleDownload}>
          <Ionicons name="download-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Download CV</Text>
        </TouchableOpacity>

        <ScrollView style={styles.pdfPlaceholder}>
            <Text style={styles.placeholderText}>
                [PDF Viewer Placeholder]
                {"\n\n"}
                On mobile, it is best practice to open PDFs in the system viewer.
                {"\n"}
                Click the button above to view the resume.
            </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    paddingTop: 80
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  headerContainer: {
      marginBottom: 30
  },
  headerText: {
      fontSize: 30,
      color: COLORS.textPrim,
      fontWeight: 'bold'
  },
  purpleText: {
      color: COLORS.purple
  },
  button: {
    backgroundColor: COLORS.purple,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    gap: 10,
    marginBottom: 40,
    shadowColor: COLORS.purple,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.textPrim,
    fontSize: 16,
    fontWeight: 'bold'
  },
  pdfPlaceholder: {
      width: '100%',
      height: 400,
      backgroundColor: COLORS.cardBg,
      borderRadius: 10,
      padding: 20
  },
  placeholderText: {
      color: 'rgba(255,255,255,0.7)', // Could be COLORS.textSec
      textAlign: 'center',
      marginTop: 100,
      fontSize: 16,
      lineHeight: 24
  }
});
