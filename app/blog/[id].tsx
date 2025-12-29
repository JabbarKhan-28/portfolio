
import { COLORS } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { createURL } from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Animatable from "react-native-animatable";

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadBlog = async () => {
      try {
        const snap = await getDoc(doc(db, "blogs", String(id)));
        if (snap.exists()) {
            setBlog({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
          console.error("Error loading blog", e);
      } finally {
          setLoading(false);
      }
    };
    loadBlog();
  }, [id]);

  const openPdfBlog = async () => {
      if (!blog?.pdfPath) return;
      try {
          await WebBrowser.openBrowserAsync(blog.pdfPath);
      } catch (e) {
          Linking.openURL(blog.pdfPath);
      }
  };

  const handleShare = async () => {
      if (!blog) return;
    try {
        // Share this page's URL
        const url = createURL(`/blog/${blog.id}`);
        await Share.share({
            message: `Read this blog: "${blog.title}"\n\n${blog.summary}\n\nLink: ${url}`,
            url: url,
            title: blog.title,
        });
    } catch (error) {
        console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (!blog) {
      return (
          <View style={styles.container}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrim} />
                </TouchableOpacity>
              </View>
              <View style={styles.loader}>
                  <Text style={{color: COLORS.textSec}}>Blog not found.</Text>
              </View>
          </View>
      )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 20) }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/blog')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrim} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={COLORS.textPrim} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Background Glows */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <Animatable.View 
            animation="fadeInUp" 
            duration={800} 
            style={StyleSheet.flatten([styles.card, { padding: width < 450 ? 20 : 35 }])}
        >



            <Text style={styles.date}>{blog.date}</Text>
            <Text style={StyleSheet.flatten([styles.title, width < 450 && { fontSize: 24 }])}>{blog.title}</Text>
            <View style={styles.divider} />
            <Text style={StyleSheet.flatten([styles.summary, width < 450 && { fontSize: 16, lineHeight: 24 }])}>{blog.summary}</Text>




            <TouchableOpacity style={styles.readBtn} onPress={openPdfBlog}>
                <Ionicons name="document-text" size={20} color={COLORS.primaryBg} />
                <Text style={styles.readBtnText}>Read Full Article</Text>
            </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    zIndex: 20
  },


  glowTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.glowPurple,
    opacity: 0.2,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.glowCyan,
    opacity: 0.1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
      padding: 20,
      alignItems: 'center'
  },


  card: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 24,
      width: '100%',
      maxWidth: 800,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      elevation: 8,
      shadowColor: COLORS.textHighlight,
      shadowOpacity: 0.1,
      shadowRadius: 15
  },
  date: {
      color: COLORS.textHighlight,
      fontWeight: '900',
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 2,
      fontSize: Platform.OS === 'android' ? 16 : 12

  },


  title: {
      color: COLORS.textPrim,
      fontSize: Platform.OS === 'android' ? 36 : 28,

      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20
  },


  divider: {
      height: 1,
      backgroundColor: COLORS.border,
      width: 100,
      marginBottom: 20
  },
  summary: {
      color: COLORS.textSec,
      fontSize: Platform.OS === 'android' ? 22 : 18,

      lineHeight: 28,
      textAlign: 'center',
      marginBottom: 40
  },


  readBtn: {
      backgroundColor: COLORS.textHighlight,
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 20,
      alignItems: 'center',
      shadowColor: COLORS.textHighlight,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8
  },
  readBtnText: {
      color: COLORS.primaryBg,
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 0.5
  }


});
