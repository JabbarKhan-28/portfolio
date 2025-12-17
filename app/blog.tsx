import AddBlogModal from "@/components/AddBlogModal";
import CustomAlertModal, { AlertType } from "@/components/CustomAlertModal";
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";

interface BlogPost {
  id: string;
  title: string;
  date?: string;
  summary: string;
  pdfPath: string;
  imageUrl?: string;
}

export default function BlogScreen() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, type: "info", title: "", message: "" });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) =>
    setAlertConfig({ visible: true, type, title, message, onConfirm });

  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const [secretTaps, setSecretTaps] = useState(0);
  const handleSecretLogin = () => {
    if (user) return;
    const taps = secretTaps + 1;
    setSecretTaps(taps);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (taps >= 5) {
      setSecretTaps(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/login");
    }
    setTimeout(() => setSecretTaps(0), 2000);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubBlogs = onSnapshot(
      q,
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
        setBlogs(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => {
      unsubAuth();
      unsubBlogs();
    };
  }, []);

  const openPdfBlog = (pdfUrl: string) => {
    Haptics.selectionAsync();
    let finalUrl = pdfUrl;
    if (finalUrl.includes("dropbox.com") && finalUrl.includes("dl=0")) {
      finalUrl = finalUrl.replace("dl=0", "raw=1");
    }
    if (Platform.OS === 'web') {
      window.open(finalUrl, '_blank');
    } else {
      WebBrowser.openBrowserAsync(finalUrl).catch(() => showAlert("error", "Error", "Could not open link."));
    }
  };

  const handleDelete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    showAlert("confirm", "Delete Blog", "Delete this blog?", async () => {
      try {
        await deleteDoc(doc(db, "blogs", id));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        hideAlert();
      } catch (e: any) {
        hideAlert();
        showAlert("error", "Error", e.message);
      }
    });
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut(auth);
  };

  const filteredBlogs = blogs.filter(blog => {
    const query = searchQuery.toLowerCase();
    return blog.title.toLowerCase().includes(query) || blog.summary.toLowerCase().includes(query);
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={{ width: 40 }} />
            <TouchableOpacity onPress={handleSecretLogin}>
              <Text style={styles.headerText}>
                My <Text style={styles.purpleText}>Blogs</Text>
              </Text>
            </TouchableOpacity>
            {user ? (
              <TouchableOpacity onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color={COLORS.textSec} />
              </TouchableOpacity>
            ) : <View style={{ width: 40 }} />}
          </View>
          <Text style={styles.subText}>Thoughts, tutorials, and tech ramblings.</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSec} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search blogs..."
              placeholderTextColor={COLORS.textSec}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSec} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.purple} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.listContainer}>
            {filteredBlogs.length === 0 ? (
              <Text style={styles.emptyText}>
                {searchQuery ? "No blogs matching your search." : "No blog posts yet."}
              </Text>
            ) : (
              filteredBlogs.map((blog, index) => (
                <Animatable.View
                  key={blog.id}
                  animation="fadeInUp"
                  duration={800}
                  delay={index * 150}
                  style={styles.blogCard}
                >
                  <View style={styles.cardBody}>
                    <Text style={styles.blogTitle}>{blog.title}</Text>
                    <Text style={styles.blogDate}>{blog.date}</Text>
                    <Text style={styles.blogSummary}>{blog.summary}</Text>
                    <TouchableOpacity style={styles.readMoreBtn} onPress={() => openPdfBlog(blog.pdfPath)}>
                      <Ionicons name="document-text-outline" size={20} color={COLORS.textPrim} />
                      <Text style={styles.readMoreText}>Read</Text>
                    </TouchableOpacity>
                  </View>
                  {user && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(blog.id)}>
                      <Ionicons name="trash" size={20} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </Animatable.View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {user && (
        <Animatable.View animation="zoomIn" delay={500} style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </Animatable.View>
      )}

      <AddBlogModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          showAlert('success', 'Published!', 'Blog successfully published.');
          setTimeout(hideAlert, 1500);
        }}
      />

      <CustomAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        confirmText="Delete"
      />
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBg },
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  headerContainer: { alignItems: "center", marginBottom: 30 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" },
  headerText: { fontSize: 28, fontWeight: "bold", color: COLORS.textPrim },
  purpleText: { color: COLORS.purple },
  subText: { color: COLORS.textSec, fontSize: 16 },
  listContainer: { gap: 20 },
  emptyText: { color: COLORS.textSec, textAlign: "center", marginTop: 50 },
  blogCard: { backgroundColor: COLORS.cardBg, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "rgba(199,112,240,0.2)" },
  deleteBtn: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,68,68,0.8)", padding: 8, borderRadius: 20, zIndex: 10 },
  cardBody: { padding: 20 },
  blogTitle: { color: COLORS.textPrim, fontSize: 20, fontWeight: "bold", textAlign: "center" },
  blogDate: { color: COLORS.textSec, fontSize: 12, textAlign: "center", marginBottom: 10 },
  blogSummary: { color: COLORS.textSec, fontSize: 15, lineHeight: 22, marginBottom: 20, textAlign: "center" },
  readMoreBtn: { backgroundColor: COLORS.darkPurple, flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, alignSelf: "center" },
  readMoreText: { color: COLORS.textPrim, fontWeight: "bold" },
  fabContainer: { position: "absolute", bottom: 100, right: 20 },
  fab: { backgroundColor: COLORS.purple, width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 5 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.cardBg, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, marginTop: 20, width: "100%", borderWidth: 1, borderColor: "rgba(199,112,240,0.1)" },
  searchInput: { flex: 1, color: COLORS.textPrim, marginLeft: 10, fontSize: 16 },
});
