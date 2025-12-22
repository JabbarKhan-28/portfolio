
import { COLORS } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
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
    View
} from "react-native";
import * as Animatable from "react-native-animatable";

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

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
        const url = Linking.createURL(`/blog/${blog.id}`);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/blog')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrim} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={COLORS.textPrim} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
            <Text style={styles.date}>{blog.date}</Text>
            <Text style={styles.title}>{blog.title}</Text>
            <View style={styles.divider} />
            <Text style={styles.summary}>{blog.summary}</Text>

            <TouchableOpacity style={styles.readBtn} onPress={openPdfBlog}>
                <Ionicons name="document-text" size={20} color="#FFF" />
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
    paddingTop: Platform.OS === 'web' ? 20 : 60,
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
      padding: 30,
      borderRadius: 20,
      width: '100%',
      maxWidth: 800,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center'
  },
  date: {
      color: COLORS.purple,
      fontWeight: 'bold',
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 1
  },
  title: {
      color: COLORS.textPrim,
      fontSize: 28,
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
      fontSize: 18,
      lineHeight: 28,
      textAlign: 'center',
      marginBottom: 40
  },
  readBtn: {
      backgroundColor: COLORS.purple,
      flexDirection: 'row',
      gap: 10,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 100,
      alignItems: 'center',
      shadowColor: COLORS.purple,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8
  },
  readBtnText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold'
  }
});
