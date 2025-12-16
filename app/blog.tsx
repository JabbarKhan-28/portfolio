import AddBlogModal from "@/components/AddBlogModal";
import CustomAlertModal, { AlertType } from "@/components/CustomAlertModal";
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  summary: string;
  mediumLink?: string;
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

    if (newTaps >= 5) {
      setSecretTaps(0);
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
    if (url) Linking.openURL(url);
  };

  const handleDelete = (id: string) => {
    showAlert(
        "confirm",
        "Delete Blog",
        "Are you sure you want to delete this blog post?",
        async () => {
            try {
                await deleteDoc(doc(db, "blogs", id));
                hideAlert(); // Auto close on success (snapshot updates UI)
            } catch (error: any) {
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
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
         <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
              <TouchableOpacity activeOpacity={1} onPress={handleSecretLogin}>
                <Text style={styles.headerText}>
                  My <Text style={styles.purpleText}>Blogs</Text>
                </Text>
              </TouchableOpacity>
              
              {/* Logout Button (Only visible when logged in) */}
              {user && (
                 <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
                   <Ionicons name="log-out-outline" size={24} color={COLORS.textSec} />
                 </TouchableOpacity>
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
                 blogs.map((blog) => (
                    <View key={blog.id} style={styles.blogCard}>
                       <View style={styles.blogHeader}>
                           <View>
                             <Text style={styles.blogTitle}>{blog.title}</Text>
                             <Text style={styles.blogDate}>{blog.date}</Text>
                           </View>
                           {user && (
                             <TouchableOpacity onPress={() => handleDelete(blog.id)}>
                               <Ionicons name="trash-outline" size={20} color="#ff4444" />
                             </TouchableOpacity>
                           )}
                       </View>
                       <Text style={styles.blogSummary}>{blog.summary}</Text>
                       
                       <TouchableOpacity 
                           style={styles.readMoreBtn}
                           onPress={() => handleReadMore(blog.mediumLink)}
                       >
                           <Text style={styles.readMoreText}>Read Article</Text>
                           <Ionicons name="open-outline" size={16} color={COLORS.purple} />
                       </TouchableOpacity>
                    </View>
                 ))
               )}
            </View>
         )}
      </ScrollView>

      {/* Floating Action Button for Admin */}
      {user && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
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
    paddingBottom: 100
  },
  headerContainer: {
      marginBottom: 30
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
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
      padding: 20,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.purple
  },
  blogHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10
  },
  blogTitle: {
      color: COLORS.textPrim,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5
  },
  blogDate: {
      color: COLORS.textSec,
      fontSize: 12,
      fontStyle: 'italic'
  },
  blogSummary: {
      color: COLORS.textSec,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 15
  },
  readMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5
  },
  readMoreText: {
      color: COLORS.purple,
      fontWeight: 'bold'
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
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
