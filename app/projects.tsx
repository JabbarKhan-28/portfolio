
import AddProjectModal from "@/components/AddProjectModal";
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
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import * as Animatable from 'react-native-animatable';

export interface Project {
  id: string;
  title: string;
  description: string;
  ghLink: string;
  demoLink: string;
  imageUrl?: string;
}

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
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

    // Real-time Project Fetching
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projectList: Project[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      setProjects(projectList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
    };
  }, []);

  const handleDelete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    showAlert(
        "destructive",
        "Delete Project",
        "Are you sure you want to delete this project?",
        async () => {
            try {
                await deleteDoc(doc(db, "projects", id));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                hideAlert();
            } catch (error: any) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                hideAlert();
                setTimeout(() => {
                    showAlert("error", "Error", error.message);
                }, 400); 
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
                        My Recent <Text style={styles.purpleText}>Works</Text>
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
            <Text style={styles.subText}>Here are a few projects I've worked on recently.</Text>
        </View>

        {loading ? (
            <ActivityIndicator size="large" color={COLORS.purple} style={{ marginTop: 50 }} />
        ) : (
            <View style={styles.projectsContainer}>
                {projects.length === 0 ? (
                    <Text style={styles.emptyText}>No projects added yet.</Text>
                ) : (
                    projects.map((project, index) => (
                        <ProjectCardWrapper key={project.id} index={index}>
                            <ProjectCard 
                                project={project} 
                                onDelete={user ? () => handleDelete(project.id) : undefined} 
                            />
                        </ProjectCardWrapper>
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

        <AddProjectModal 
            visible={modalVisible} 
            onClose={() => setModalVisible(false)} 
            onSuccess={() => {
                showAlert('success', 'Published!', 'Project successfully added.');
                setTimeout(() => hideAlert(), 1500); // Auto-close alert
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

function ProjectCardWrapper({ children, index }: { children: React.ReactNode, index: number }) {
    const { width } = useWindowDimensions();
    const isTablet = width > 768;
    const isDesktop = width > 1024;
    
    // Calculate width: 100% on mobile, ~48% on tablet, ~31% on desktop
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

function ProjectCard({ project, onDelete }: { project: Project, onDelete?: () => void }) {
    const handleLink = (url: string) => {
        if (url) {
            Haptics.selectionAsync();
            Linking.openURL(url);
        }
    }

    const [imgSource, setImgSource] = useState(
        project.imageUrl ? { uri: project.imageUrl } : require('../assets/icon.png')
    );

    return (
        <View style={styles.card}>
            {/* Image Placeholder or Custom Image */}
            <View style={styles.imageContainer}>
                 <Image 
                    source={imgSource}
                    style={styles.projectImage} 
                    contentFit="cover" // Changed to cover for fuller, premium look
                    transition={500}
                    onError={() => setImgSource(require('../assets/icon.png'))} 
                 />
                 {/* Gradient Overlay for Text Readability if we overlapped, but here separate */}
                 {onDelete && (
                     <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                         <Ionicons name="trash" size={18} color="#FFF" />
                     </TouchableOpacity>
                 )}
            </View>
            
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{project.title}</Text>
                <Text style={styles.cardDescription}>{project.description}</Text>
                
                <View style={styles.buttonsContainer}>
                    {project.ghLink ? (
                        <TouchableOpacity style={styles.button} onPress={() => handleLink(project.ghLink)}>
                            <Ionicons name="logo-github" size={18} color={COLORS.primaryBg} />
                            <Text style={styles.buttonText}>Code</Text>
                        </TouchableOpacity>
                    ) : null}
                    
                    {project.demoLink ? (
                         <TouchableOpacity style={[styles.button, styles.demoButton]} onPress={() => handleLink(project.demoLink)}>
                            <Ionicons name="rocket-outline" size={18} color="#FFF" />
                            <Text style={[styles.buttonText, { color: '#FFF' }]}>Live Demo</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
    backgroundColor: COLORS.primaryBg,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100
  },
  headerContainer: {
      alignItems: 'center',
      marginBottom: 30
  },
  headerText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.textPrim,
      marginBottom: 10
  },
  purpleText: {
      color: COLORS.purple
  },
  subText: {
      color: COLORS.textPrim,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 5
  },
  projectsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
      justifyContent: 'center' // Center cards when wrapping
  },
  emptyText: {
    color: COLORS.textSec,
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)', // Ultra subtle glass
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      ...Platform.select({
          web: {
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
          },
          default: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5
          }
      })
  },
  imageContainer: {
      height: 220,
      width: '100%',
      backgroundColor: 'rgba(0,0,0,0.2)', // Slightly darker for contrast
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
  },
  projectImage: {
      width: '100%',
      height: '100%'
  },
  deleteBtn: {
      position: 'absolute',
      top: 15,
      right: 15,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 10,
      borderRadius: 30, // Full circle
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  cardBody: {
      padding: 24,
      alignItems: 'center'
  },
  cardTitle: {
      fontSize: 24,
      fontWeight: '800', // Extra bold
      color: COLORS.textPrim,
      marginBottom: 8,
      textAlign: 'center',
      letterSpacing: 0.5
  },
  cardDescription: {
      color: COLORS.textSec, // Softer color
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
      fontSize: 15
  },
  buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
      width: '100%'
  },
  button: {
      backgroundColor: COLORS.textHighlight, // Bright Cyan
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10, // Pill shape
      gap: 8,
      flex: 1, // Equal width buttons
      minWidth: 120
  },
  demoButton: {
      backgroundColor: COLORS.purple, // Different color for Demo
  },
  buttonText: {
      color: COLORS.primaryBg, // Dark text on bright button
      fontWeight: 'bold',
      fontSize: 14
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

