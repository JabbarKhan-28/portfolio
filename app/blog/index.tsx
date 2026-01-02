import AddBlogModal, { type BlogPost } from "@/components/AddBlogModal";
import CustomAlertModal, { AlertType } from "@/components/CustomAlertModal";
import NewsletterSection from "@/components/NewsletterSection";
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useFocusEffect, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
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
    View
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Animatable from "react-native-animatable";

export default function BlogScreen() {
  const insets = useSafeAreaInsets();
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
    return () => unsubAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const unsubBlogs = onSnapshot(
        q,
        snap => {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
          setBlogs(list);
          setLoading(false);
        },
        (error) => {
            console.error("Error fetching blogs:", error);
            setLoading(false);
        }
      );

      return () => unsubBlogs();
    }, [])
  );

  const incrementBlogView = async (id: string) => {
      try {
          const ref = doc(db, 'blogs', id);
          await updateDoc(ref, {
              views: increment(1)
          });
      } catch (e) {
          console.error("View increment failed", e);
      }
  };

  const openPdfBlog = async (blog: BlogPost) => {
    Haptics.selectionAsync();
    incrementBlogView(blog.id);
    try {
        // Open directly in browser / system viewer
        // This handles Google Drive links much better than an in-app generic PDF viewer
        await WebBrowser.openBrowserAsync(blog.pdfPath);
    } catch (e) {
        console.error("Failed to open link", e);
        // Fallback
        Linking.openURL(blog.pdfPath);
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
    // Visibility Check
    // If private, only show if user is logged in (admin)
    if (blog.isPrivate && !user) return false;

    const query = searchQuery.toLowerCase();
    return blog.title.toLowerCase().includes(query) || blog.summary.toLowerCase().includes(query);
  });

  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 768;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={StyleSheet.flatten([styles.contentContainer, { paddingHorizontal: width < 400 ? 15 : 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }])} showsVerticalScrollIndicator={false}>


        {/* Background Glows */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={{ width: 40 }} />
            <TouchableOpacity onPress={handleSecretLogin}>
              <Text style={[
                  styles.headerText,
                  isMobileWeb && { fontSize: 36, lineHeight: 42 }
              ]}>
                The <Text style={styles.purpleText}>Notebook</Text>
              </Text>
            </TouchableOpacity>
            {user ? (
              <TouchableOpacity onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color={COLORS.textSec} />
              </TouchableOpacity>
            ) : <View style={{ width: 40 }} />}
          </View>
          <Text style={styles.subText}>Exploring the intersection of code, design, and creativity.</Text>
          
          <Animatable.View animation="fadeIn" delay={300} style={styles.searchContainer}>
            <Ionicons name="search" size={22} color={COLORS.textHighlight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={COLORS.textSec} />
              </TouchableOpacity>
            )}
          </Animatable.View>
        </View>

        <Animatable.View animation="fadeIn" delay={400} style={{ marginBottom: 20 }}>
            <NewsletterSection compact />
        </Animatable.View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.purple} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.listContainer}>
            {filteredBlogs.length === 0 ? (
              <Text style={styles.emptyText}>
                {searchQuery ? "No matching articles found." : "The notebook is currently empty."}
              </Text>
            ) : (
              filteredBlogs.map((blog, index) => (
                <BlogCardWrapper key={blog.id} index={index}>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => openPdfBlog(blog)}>
                      <View style={[
                          styles.blogCard,
                          isMobileWeb && {
                             boxShadow: 'none',
                             backdropFilter: 'none',
                             transition: 'none',
                             shadowColor: COLORS.textHighlight,
                             shadowOffset: { width: 0, height: 10 },
                             shadowOpacity: 0.2,
                             shadowRadius: 20,
                        } as any
                      ]}>
                          <View style={StyleSheet.flatten([styles.cardBody, { padding: width < 450 ? 20 : 30 }])}>
                              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8}}>
                                  <Text style={[styles.blogDate, isMobileWeb && { fontSize: 14 }, {marginBottom: 0}]}>{blog.date}</Text>
                                  {blog.isPrivate && <Ionicons name="lock-closed" size={12} color={COLORS.textHighlight} />}
                                  <View style={{ width: 1, height: 12, backgroundColor: COLORS.textSec, opacity: 0.5, marginHorizontal: 4 }} />
                                  <Ionicons name="eye-outline" size={12} color={COLORS.textSec} />
                                  <Text style={{ color: COLORS.textSec, fontSize: 12, fontWeight: '600' }}>{blog.views || 0}</Text>
                              </View>
                              <Text style={StyleSheet.flatten([styles.blogTitle, { fontSize: width < 450 ? 20 : 22, height: width < 450 ? 56 : 60 }])} numberOfLines={2}>{blog.title}</Text>




                              <View style={styles.cardDivider} />
                              <View style={styles.summaryContainer}>
                                <Text style={[styles.blogSummary, isMobileWeb && { fontSize: 18 }]} numberOfLines={3}>{blog.summary}</Text>
                              </View>
                              
                              <View style={styles.readMoreBtn}>
                                  <Text style={styles.readMoreText}>Continue Reading</Text>
                                  <Ionicons name="arrow-forward" size={18} color={COLORS.primaryBg} />
                              </View>
                          </View>
                          
                          <View style={styles.topActions}>
                              <TouchableOpacity style={styles.actionBtnIcon} onPress={() => handleShare(blog)}>
                                  <Ionicons name="share-social" size={16} color={COLORS.textPrim} />
                              </TouchableOpacity>

                              {user && (
                                  <>
                                       <TouchableOpacity style={StyleSheet.flatten([styles.actionBtnIcon, { backgroundColor: COLORS.textHighlight }])} onPress={() => handleEdit(blog)}>
                                           <Ionicons name="create" size={16} color={COLORS.primaryBg} />
                                       </TouchableOpacity>
                                       <TouchableOpacity style={StyleSheet.flatten([styles.actionBtnIcon, { backgroundColor: COLORS.error }])} onPress={() => handleDelete(blog.id)}>
                                           <Ionicons name="trash" size={16} color="#FFF" />
                                       </TouchableOpacity>

                                  </>
                              )}
                          </View>
                      </View>
                    </TouchableOpacity>
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
  container: { 
    flex: 1, 
    backgroundColor: COLORS.primaryBg 
  },
  contentContainer: { 
    position: 'relative'
  },

  glowTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.glowPurple,
    opacity: 0.5,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.glowCyan,
    opacity: 0.3,
  },
  headerContainer: { 
    alignItems: "center", 
    marginBottom: 40 
  },
  headerRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "100%", 
    alignItems: "center" 
  },
  headerText: {
     fontSize: Platform.OS === 'android' ? 36 : 34,
     fontWeight: "900",
     color: COLORS.textPrim,
     textAlign: "center",
     letterSpacing: -1,
     lineHeight: Platform.OS === 'android' ? 42 : 40,
   },
  purpleText: { 
    color: COLORS.textHighlight 
  },
  subText: { 
    color: COLORS.textSec, 
    fontSize: Platform.OS === 'android' ? 18 : 16, 
 
    textAlign: 'center', 
    marginTop: 10,
    maxWidth: 500,
    lineHeight: 24
  },


  
  listContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 25, 
    justifyContent: 'center' 
  },
  emptyText: { 
    color: COLORS.textMuted, 
    textAlign: "center", 
    marginTop: 60,
    fontSize: 20
  },
  
  blogCard: { 
      borderRadius: 32, 
      overflow: "hidden", 
      borderWidth: 1.5, 
      borderColor: COLORS.border,
      ...Platform.select({
          web: {
              boxShadow: '0 10px 40px 0 rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          } as any,

          default: {
              // elevation removed
              shadowColor: COLORS.textHighlight,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
          }
      })
  },
  
  cardBody: { 
    alignItems: 'center',
    width: '100%' 
  },
  
  blogTitle: { 
    fontSize: Platform.OS === 'android' ? 26 : 22,
    color: COLORS.textPrim, 
    fontWeight: "900", 
    textAlign: "center", 
    marginBottom: 12,
    lineHeight: 28,
    letterSpacing: -0.5,
  },


  blogDate: { 
    color: COLORS.textHighlight, 
    fontSize: Platform.OS === 'android' ? 14 : 12, 
 
    fontWeight: '800', 
    textAlign: "center", 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 2 
  },


  cardDivider: {
    width: 30,
    height: 3,
    backgroundColor: COLORS.textHighlight,
    borderRadius: 2,
    marginBottom: 20
  },
  summaryContainer: {
    height: 72, // 3 lines approx
    marginBottom: 25,
    justifyContent: 'center',
    width: '100%'
  },
  blogSummary: { 
    color: COLORS.textSec, 
    fontSize: Platform.OS === 'android' ? 18 : 16, 
 
    lineHeight: 22, 
    textAlign: "center",
    opacity: 0.9
  },


  
  readMoreBtn: { 
      backgroundColor: COLORS.textHighlight, 
      flexDirection: "row", 
      alignItems: "center", 
      justifyContent: 'center',
      gap: 12, 
      paddingVertical: 14, 
      paddingHorizontal: 28, 
      borderRadius: 20,
      width: '100%',
      shadowColor: COLORS.textHighlight,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8 // Enhanced Android elevation
  },
  readMoreText: { 
    color: COLORS.primaryBg, 
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5
  },
  
  topActions: {
      position: "absolute",
      top: 15,
      right: 15,
      flexDirection: 'row',
      gap: 10,
      zIndex: 10
  },
  actionBtnIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  
  fabContainer: { 
    position: "absolute", 
    bottom: 110, 
    right: 25 
  },
  fab: { 
    backgroundColor: COLORS.textHighlight, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 10,
    shadowColor: COLORS.textHighlight,
    shadowOpacity: 0.5,
    shadowRadius: 10
  },
  
  searchContainer: { 
      flexDirection: "row", 
      alignItems: "center", 
      backgroundColor: COLORS.darkBg, 
      borderRadius: 20, 
      paddingHorizontal: 20, 
      paddingVertical: Platform.OS === 'android' ? 8 : 14, 
      marginTop: 30, 
      width: "100%", 
      maxWidth: 600,
      borderWidth: 1.5, 
      borderColor: COLORS.border,
      elevation: 4 
  },


  searchInput: { 
    flex: 1, 
    color: COLORS.textPrim, 
    marginLeft: 12, 
    fontSize: 18,
    fontWeight: '500'
  },
});
