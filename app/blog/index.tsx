import AddBlogModal, { type BlogPost } from "@/components/AddBlogModal";
import CustomAlertModal, { AlertType } from "@/components/CustomAlertModal";
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,

  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";

export default function BlogScreen() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

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

  const openPdfBlog = async (pdfUrl: string) => {
    Haptics.selectionAsync();
    try {
        // Open directly in browser / system viewer
        // This handles Google Drive links much better than an in-app generic PDF viewer
        await WebBrowser.openBrowserAsync(pdfUrl);
    } catch (e) {
        console.error("Failed to open link", e);
        // Fallback
        Linking.openURL(pdfUrl);
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

  const handleEdit = (blog: BlogPost) => {
      Haptics.selectionAsync();
      setEditingBlog(blog);
      setModalVisible(true);
  }

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut(auth);
  };

  const handleShare = async (blog: BlogPost) => {
    Haptics.selectionAsync();
    try {
      // 1. Generate URL
      // On Web: Use current window location to ensure it works in deployments
      // On Native: Use Linking.createURL or deep link scheme
      let url = "";
      if (Platform.OS === 'web') {
          // e.g. https://my-portfolio.com/blog/123
          url = `${window.location.origin}/blog/${blog.id}`;
      } else {
          url = Linking.createURL(`/blog/${blog.id}`);
      }
      
      const message = `Check out this blog: "${blog.title}"\n\n${blog.summary}`;
      
      // 2. Share
      const result = await Share.share({
        message: `${message}\n\nRead here: ${url}`,
        url: url, // iOS/Web
        title: blog.title, // Android
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.error("Share failed:", error);
      // Fallback: Copy to clipboard if Share API fails (common on some desktop browsers)
      if (Platform.OS === 'web') {
          try {
              let url = `${window.location.origin}/blog/${blog.id}`;
              await navigator.clipboard.writeText(url);
              showAlert('success', 'Link Copied', 'The link has been copied to your clipboard.');
              setTimeout(hideAlert, 2000);
          } catch (clipErr) {
              console.error("Clipboard failed", clipErr);
          }
      }
    }
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
                <BlogCardWrapper key={blog.id} index={index}>
                    <View style={styles.blogCard}>
                        <View style={styles.cardBody}>
                            <Text style={styles.blogTitle}>{blog.title}</Text>
                            <Text style={styles.blogDate}>{blog.date}</Text>
                            <Text style={styles.blogSummary}>{blog.summary}</Text>
                            
                            <TouchableOpacity style={styles.readMoreBtn} onPress={() => openPdfBlog(blog.pdfPath)}>
                                <Ionicons name="document-text-outline" size={18} color={COLORS.primaryBg} />
                                <Text style={styles.readMoreText}>Read Article</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.topActions}>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} onPress={() => handleShare(blog)}>
                                <Ionicons name="share-social-outline" size={18} color={COLORS.textPrim} />
                            </TouchableOpacity>

                            {user && (
                                <>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.textHighlight }]} onPress={() => handleEdit(blog)}>
                                        <Ionicons name="create" size={18} color={COLORS.primaryBg} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255, 59, 48, 0.8)' }]} onPress={() => handleDelete(blog.id)}>
                                        <Ionicons name="trash" size={18} color="#FFF" />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </BlogCardWrapper>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {user && (
        <Animatable.View animation="zoomIn" delay={500} style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => { setEditingBlog(null); setModalVisible(true); }}>
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </Animatable.View>
      )}

      <AddBlogModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingBlog(null); }}
        blogToEdit={editingBlog}
        onSuccess={() => {
          showAlert('success', 'Success!', `Blog ${editingBlog ? 'updated' : 'published'} successfully.`);
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

// Responsive Wrapper
function BlogCardWrapper({ children, index }: { children: React.ReactNode, index: number }) {
    const { width } = useWindowDimensions();
    const isTablet = width > 768;
    const isDesktop = width > 1024;
    const cardWidth = isDesktop ? '31%' : isTablet ? '48%' : '100%';

    return (
        <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={index * 100}
            style={{ width: cardWidth }}
        >
            {children}
        </Animatable.View>
    );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBg },
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  headerContainer: { alignItems: "center", marginBottom: 30 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" },
  headerText: { fontSize: Platform.OS === 'web' ? 28 : 24, fontWeight: "bold", color: COLORS.textPrim },
  purpleText: { color: COLORS.purple },
  subText: { color: COLORS.textSec, fontSize: 16, textAlign: 'center', marginTop: 5 },
  
  listContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
  emptyText: { color: COLORS.textSec, textAlign: "center", marginTop: 50 },
  
  blogCard: { 
      backgroundColor: COLORS.cardBg, 
      borderRadius: 16, 
      overflow: "hidden", 
      borderWidth: 1, 
      borderColor: COLORS.border,
      ...Platform.select({
          web: {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
          },
          default: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 8,
          }
      })
  },
  
  cardBody: { padding: 16, alignItems: 'center' },
  
  blogTitle: { color: COLORS.textPrim, fontSize: Platform.OS === 'web' ? 22 : 18, fontWeight: "800", textAlign: "center", marginBottom: 5 },
  blogDate: { color: COLORS.purple, fontSize: 12, fontWeight: 'bold', textAlign: "center", marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  blogSummary: { color: COLORS.textSec, fontSize: 15, lineHeight: 24, marginBottom: 25, textAlign: "center" },
  
  cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  
  readMoreBtn: { 
      backgroundColor: COLORS.textHighlight, 
      flexDirection: "row", 
      alignItems: "center", 
      gap: 8, 
      paddingVertical: 12, 
      paddingHorizontal: 20, 
      borderRadius: 12 
  },
  readMoreText: { color: COLORS.primaryBg, fontWeight: "bold" },
  
  shareBtn: {
      backgroundColor: COLORS.inputBg,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
      justifyContent: 'center',
      alignItems: 'center'
  },
  
  topActions: {
      position: "absolute",
      top: 15,
      right: 15,
      flexDirection: 'row',
      gap: 10,
      zIndex: 10
  },
  actionBtn: {
      padding: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center'
  },
  
  fabContainer: { position: "absolute", bottom: 100, right: 20 },
  fab: { backgroundColor: COLORS.purple, width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 5 },
  
  searchContainer: { 
      flexDirection: "row", 
      alignItems: "center", 
      backgroundColor: COLORS.inputBg, 
      borderRadius: 12, 
      paddingHorizontal: 15, 
      paddingVertical: 12, 
      marginTop: 20, 
      width: "100%", 
      maxWidth: 600,
      borderWidth: 1, 
      borderColor: COLORS.border 
  },
  searchInput: { flex: 1, color: COLORS.textPrim, marginLeft: 10, fontSize: 16 },
});
