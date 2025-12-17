import { COLORS } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PdfViewerProps {
  uri: string;
}

export default function PdfViewer({ uri }: PdfViewerProps) {
  const [loading, setLoading] = React.useState(true);

  // On Web, use an iframe to embed the PDF
  if (Platform.OS === 'web') {
      // Use Google Docs Viewer to bypass X-Frame-Options for external URLs
      const embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        uri
      )}&embedded=true`;
      
      return (
          <View style={styles.container}>
              {loading && (
                  <ActivityIndicator 
                    size="large" 
                    color={COLORS.purple} 
                    style={StyleSheet.absoluteFill} 
                  />
              )}
              <iframe 
                src={embedUrl} 
                style={{ width: '100%', height: '100%', border: 'none' }} 
                title="PDF Viewer"
                onLoad={() => setLoading(false)}
              />
              
              {/* Fallback Button */}
              <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
                  <TouchableOpacity 
                      onPress={() => window.open(uri, '_blank')}
                      style={[styles.btn, { opacity: 0.9 }]}
                  >
                      <Text style={styles.btnText}>Open in Browser</Text>
                  </TouchableOpacity>
              </View>
          </View>
      )
  }

  // On Native, open externally (or use WebView if added later)
  const handleOpenPdf = async () => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) {
        await Linking.openURL(uri);
      } else {
        console.error("Don't know how to open URI: " + uri);
      }
    } catch (error) {
       console.error("An error occurred", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Click below to view the document
      </Text>

      <TouchableOpacity onPress={handleOpenPdf} style={styles.btn}>
        <Text style={styles.btnText}>Open PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: COLORS.textSec,
    marginBottom: 16,
    textAlign: "center",
  },
  btn: {
    backgroundColor: COLORS.purple,
    padding: 14,
    borderRadius: 8,
  },
  btnText: {
    color: COLORS.primaryBg,
    fontWeight: "bold",
  },
});
