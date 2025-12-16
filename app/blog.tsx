
import AddBlogModal from "@/components/AddBlogModal";
import CustomAlertModal, { AlertType } from "@/components/CustomAlertModal";
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  summary: string;
  mediumLink?: string;
  imageUrl?: string;
}

export default function BlogScreen() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      title: '',
      message: '',
  });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
      setAlertConfig({ visible: true, type, title, message, onConfirm });
  }

  const hideAlert = () => {
      setAlertConfig(prev => ({ ...prev, visible: false }));
  }

  // Secret Login Logic
  const [secretTaps, setSecretTaps] = useState(0);

  const handleSecretLogin = () => {
    if (user) return; // Already logged in

    const newTaps = secretTaps + 1;
    setSecretTaps(newTaps);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (newTaps >= 5) {
      setSecretTaps(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/login');
    }

    // Reset taps if no activity for 2 seconds
    setTimeout(() => {
        setSecretTaps(0);
    }, 2000);
  };

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Real-time Blog Fetching
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribeBlogs = onSnapshot(q, (snapshot) => {
      const blogList: BlogPost[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BlogPost));
      setBlogs(blogList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching blogs: ", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeBlogs();
    };
  }, []);

  const handleReadMore = (url?: string) => {
    if (url) {
        Haptics.selectionAsync();
        Linking.openURL(url);
    }
  };

  const handleDelete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    showAlert(
        "confirm",
        "Delete Blog",
        "Are you sure you want to delete this blog post?",
        async () => {
            try {
                await deleteDoc(doc(db, "blogs", id));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                hideAlert(); // Auto close on success (snapshot updates UI)
            } catch (error: any) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                hideAlert();
                setTimeout(() => {
                    showAlert("error", "Error", error.message);
                }, 400); // Wait for anim
            }
        }
    );
  };

  const handleLogout = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const openAddModal = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setModalVisible(true);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
         <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                 <View style={{ width: 40 }} /> 
                 {/* Spacer to center the title */}

                <TouchableOpacity activeOpacity={1} onPress={handleSecretLogin}>
                    <Text style={styles.headerText}>
                        My <Text style={styles.purpleText}>Blogs</Text>
                    </Text>
                </TouchableOpacity>

                {/* Logout Button */}
                {user ? (
                    <TouchableOpacity onPress={handleLogout} style={{ padding: 5 }}>
                        <Ionicons name="log-out-outline" size={24} color={COLORS.textSec} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>
            <Text style={styles.subText}>Thoughts, tutorials, and tech ramblings.</Text>
         </View>
  
         {loading ? (
            <ActivityIndicator size="large" color={COLORS.purple} style={{ marginTop: 50 }} />
         ) : (
            <View style={styles.listContainer}>
               {blogs.length === 0 ? (
                 <Text style={styles.emptyText}>No blog posts yet.</Text>
               ) : (
                 blogs.map((blog, index) => (
                    <Animatable.View 
                        key={blog.id} 
                        style={styles.blogCard}
                        animation="fadeInUp"
                        duration={800}
                        delay={index * 150}
                    >
                       <View style={styles.imageContainer}>
                            <Image 
                                source={blog.imageUrl ? { uri: blog.imageUrl } : require('../assets/images/favicon.png')} 
                                style={styles.blogImage} 
                                contentFit="cover"
                                transition={500}
                            />
                            {user && (
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(blog.id)}>
                                    <Ionicons name="trash" size={20} color="#FFF" />
                                </TouchableOpacity>
                            )}
                       </View>

                       <View style={styles.cardBody}>
                           <View>
                             <Text style={styles.blogTitle}>{blog.title}</Text>
                             <Text style={styles.blogDate}>{blog.date}</Text>
                           </View>
                           
                           <Text style={styles.blogSummary}>{blog.summary}</Text>
                           
                           <TouchableOpacity 
                               style={styles.readMoreBtn}
                               onPress={() => handleReadMore(blog.mediumLink)}
                           >
                               <Ionicons name="book-outline" size={20} color={COLORS.textPrim} />
                               <Text style={styles.readMoreText}>Read Article</Text>
                           </TouchableOpacity>
                       </View>
                    </Animatable.View>
                 ))
               )}
            </View>
         )}
      </ScrollView>

      {/* Floating Action Button for Admin */}
      {user && (
        <Animatable.View animation="zoomIn" delay={500} style={styles.fabContainer}>
            <TouchableOpacity 
            style={styles.fab} 
            onPress={openAddModal}
            >
            <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
        </Animatable.View>
      )}

      <AddBlogModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
      alignItems: 'center',
      marginBottom: 30
  },
  headerText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.textPrim,
  },
  purpleText: {
      color: COLORS.purple
  },
  iconBtn: {
    padding: 5
  },
  subText: {
      color: COLORS.textSec,
      fontSize: 16
  },
  listContainer: {
      gap: 20
  },
  emptyText: {
    color: COLORS.textSec,
    textAlign: 'center',
    marginTop: 50,
  },
  blogCard: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(199, 112, 240, 0.2)'
  },
  imageContainer: {
      height: 180,
      width: '100%',
      backgroundColor: '#2a2a2a',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
  },
  blogImage: {
      width: '100%',
      height: '100%'
  },
  deleteBtn: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(255, 68, 68, 0.8)',
      padding: 8,
      borderRadius: 20
  },
  cardBody: {
      padding: 20
  },
  blogTitle: {
      color: COLORS.textPrim,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
      textAlign: 'center'
  },
  blogDate: {
      color: COLORS.textSec,
      fontSize: 12,
      fontStyle: 'italic',
      marginBottom: 10,
      textAlign: 'center'
  },
  blogSummary: {
      color: COLORS.textSec,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 20,
      textAlign: 'justify'
  },
  readMoreBtn: {
      backgroundColor: COLORS.darkPurple,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      gap: 8,
      alignSelf: 'center'
  },
  readMoreText: {
      color: COLORS.textPrim,
      fontWeight: 'bold'
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  fab: {
    backgroundColor: COLORS.purple,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      }
    }),
  }
});

