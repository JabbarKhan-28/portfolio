import { COLORS } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import PdfViewer from "@/components/PdfViewer";


export default function PdfBlogScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const snap = await getDoc(doc(db, "blogs", String(id)));
        if (!snap.exists()) {
            setLoading(false);
            return;
        }

        const data = snap.data();
        // The 'pdfPath' field now stores the full direct URL
        let url = data.pdfPath;
        
        // Safety check: if it happens to be a storage path (legacy), we could handle it here
        // But per plan we assume URL
        
        setPdfUrl(url);
      } catch (e) {
          console.error("Error loading PDF", e);
      } finally {
          setLoading(false);
      }
    };

    loadPdf();
  }, [id]);

  if (loading || !pdfUrl) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        {!loading && <View><Text style={{color: COLORS.textSec}}>PDF not found</Text></View>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrim} />
        </TouchableOpacity>
      </View>

      <PdfViewer uri={pdfUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
