import NewsletterSection from "@/components/features/NewsletterSection";
import AddBlogModal, { type BlogPost } from "@/components/modals/AddBlogModal";
import AddSubscriberModal from "@/components/modals/AddSubscriberModal";
import CustomAlertModal, { AlertType } from "@/components/modals/CustomAlertModal";
import BackgroundGlows from "@/components/ui/BackgroundGlows";
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";

import BlogCard from "@/components/features/BlogCard";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from 'expo-blur';
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
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);

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
  const isDesktopWeb = Platform.OS === 'web' && width >= 768;
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'web') {
      // Target the parent Drawer navigator because the current Stack header is hidden
      const parent = navigation.getParent(); 
      parent?.setOptions({
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => setIsAddUserModalVisible(true)} 
            style={{ marginRight: 15 }}
          >
            <Ionicons name="person-add-outline" size={24} color={COLORS.textPrim} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={StyleSheet.flatten([styles.contentContainer, { paddingHorizontal: width < 400 ? 15 : 20, paddingTop: (Platform.OS === 'web' && width >= 768) ? 140 : insets.top + 5, paddingBottom: insets.bottom + 100 }])} showsVerticalScrollIndicator={false}>



        {/* Background Glows */}
        <BackgroundGlows top bottom />

        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
              {/* Title Centered */}
              <TouchableOpacity onPress={handleSecretLogin} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[
                    styles.headerText,
                    isDesktopWeb && styles.webHeader,
                    // Mobile Web specific override can remain or be adjusted in styles
                     isMobileWeb && { fontSize: 32, lineHeight: 38 }
                ]}>
                  The <Text style={styles.purpleText}>Notebook</Text>
                </Text>
              </TouchableOpacity>

            {/* Admin Controls Absolute Right */}
            {user && (
              <View style={{ position: 'absolute', right: 0, flexDirection: 'row', gap: 15 }}>
                <TouchableOpacity onPress={() => setIsAddUserModalVisible(true)}>
                  <Ionicons name="person-add-outline" size={24} color={COLORS.textHighlight} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={24} color={COLORS.textSec} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Text style={styles.subText}>Exploring the intersection of code, design, and creativity.</Text>
          
          <Animatable.View animation="fadeIn" delay={300} style={styles.searchContainer}>
             {Platform.OS !== 'web' && (
                 <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
             )}
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

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.textHighlight} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.grid}>
             {/* Admin Add Card */}
             {user && (
                  <Animatable.View animation="fadeInUp" duration={500} delay={100} style={styles.cardWrapper}>
                       <TouchableOpacity 
                          style={[styles.card, styles.addCard]}
                          onPress={() => {
                              setEditingBlog(null);
                              setModalVisible(true);
                          }}
                       >
                           <View style={styles.addIconContainer}>
                               <Ionicons name="add" size={40} color={COLORS.textHighlight} />
                           </View>
                           <Text style={styles.addText}>New Article</Text>
                       </TouchableOpacity>
                  </Animatable.View>
             )}

             {/* Blog Cards */}
             {filteredBlogs.map((blog, index) => {
                // Dynamic Card Width Calculation for strict grid
                let cardStyle = {};
                if (Platform.OS === 'web') {
                    if (width >= 1024) {
                        // 3 Columns
                        cardStyle = { width: '31%', flex: 0, minWidth: 350 }; 
                    } else if (width >= 768) {
                        // 2 Columns
                        cardStyle = { width: '48%', flex: 0, minWidth: 300 };
                    } else {
                        // 1 Column
                        cardStyle = { width: '100%', flex: 0 };
                    }
                }

                return (
                <Animatable.View 
                    key={blog.id} 
                    animation="fadeInUp" 
                    duration={500} 
                    delay={index * 100 + 200}
                    style={[styles.cardWrapper, cardStyle]}
                >
                    <BlogCard 
                        blog={blog} 
                        user={user}
                        onPress={() => openPdfBlog(blog)}
                        onDelete={() => handleDelete(blog.id)}
                        onEdit={() => handleEdit(blog)}
                        isMobileWeb={isMobileWeb}
                    />
                </Animatable.View>
             )})}

             {filteredBlogs.length === 0 && !loading && (
                 <View style={styles.emptyContainer}>
                     <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
                     <Text style={styles.emptyText}>No articles found.</Text>
                 </View>
             )}
          </View>
        )}
        
        <View style={styles.newsletterSection}>
            <NewsletterSection />
        </View>

      </ScrollView>

      {/* Modals */}
      <AddBlogModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        blogToEdit={editingBlog}
      />
      
      <AddSubscriberModal
        visible={isAddUserModalVisible}
        onClose={() => setIsAddUserModalVisible(false)}
        onSuccess={() => {
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
             showAlert("success", "User Added", "Subscriber has been added successfully.");
             setTimeout(hideAlert, 2000);
        }}
      />

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
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    position: 'relative' // Critical for centering
  },
  headerText: {
    fontSize: Platform.OS === 'android' ? 36 : 48, // Reduced for Android
    fontWeight: "900",
    color: COLORS.textPrim,
    textAlign: "center",
    letterSpacing: -2,
    textShadowColor: COLORS.glowPurple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  webHeader: {
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -3,
  },
  purpleText: {
    color: COLORS.textHighlight,
  },
  subText: {
    fontSize: 16,
    color: COLORS.textSec,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 600,
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 40, 0.4)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
    width: "100%",
    maxWidth: 500,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    ...Platform.select({
        web: { 
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 30px ${COLORS.textHighlight}30`
        } as any,
        default: {
             shadowColor: COLORS.textHighlight,
             shadowOffset: { width: 0, height: 4 },
             shadowOpacity: 0.2,
             shadowRadius: 10,
        }
    })
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textPrim,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center' // Centered grid
  },
  cardWrapper: {
      flexBasis: '100%', // Mobile default
      // @ts-ignore
      ...Platform.select({
          web: {
              flexBasis: 'auto', // Allow it to shrink/grow based on width media queries manually handled or minWidth
              minWidth: 350,
              maxWidth: 600,
              flex: 1
          }
      })
  },
  // Add Card Specifics
  card: {
      backgroundColor: 'rgba(30,30,40,0.6)',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      padding: 24,
      marginBottom: 20
  },
  addCard: {
      borderStyle: 'dashed',
      borderColor: COLORS.textHighlight,
      backgroundColor: 'rgba(45, 212, 191, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200, // Match typical card height
  },
  addIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(45, 212, 191, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16
  },
  addText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.textHighlight
  },
  emptyContainer: {
      width: '100%',
      alignItems: 'center',
      padding: 40,
      opacity: 0.5
  },
  emptyText: {
      marginTop: 10,
      color: COLORS.textSec,
      fontSize: 16
  },
  newsletterSection: {
      marginTop: 60,
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center'
  }
});
