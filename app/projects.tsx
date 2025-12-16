import AddProjectModal from "@/components/AddProjectModal";
import CustomAlertModal, { AlertType } from "@/components/CustomAlertModal";
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Project {
  id: string;
  title: string;
  description: string;
  ghLink: string;
  demoLink: string;
  // image?: any; // We'll user a default placeholder for now or add URL support later
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
    showAlert(
        "confirm",
        "Delete Project",
        "Are you sure you want to delete this project?",
        async () => {
            try {
                await deleteDoc(doc(db, "projects", id));
                hideAlert();
            } catch (error: any) {
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
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out: ", error);
      }
  };

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
                    projects.map((project) => (
                        <ProjectCard key={project.id} project={project} onDelete={user ? () => handleDelete(project.id) : undefined} />
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

        <AddProjectModal 
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

function ProjectCard({ project, onDelete }: { project: Project, onDelete?: () => void }) {
    const handleLink = (url: string) => {
        if (url) Linking.openURL(url);
    }

    return (
        <View style={styles.card}>
            {/* Image Placeholder */}
            <View style={styles.imageContainer}>
                 <Image 
                    source={require('../assets/Projects/icon.png')} 
                    style={styles.projectImage} 
                    contentFit="contain"
                 />
                 {onDelete && (
                     <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                         <Ionicons name="trash" size={20} color="#FFF" />
                     </TouchableOpacity>
                 )}
            </View>
            
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{project.title}</Text>
                <Text style={styles.cardDescription}>{project.description}</Text>
                
                <View style={styles.buttonsContainer}>
                    {project.ghLink ? (
                        <TouchableOpacity style={styles.button} onPress={() => handleLink(project.ghLink)}>
                            <Ionicons name="logo-github" size={20} color={COLORS.textPrim} />
                            <Text style={styles.buttonText}>GitHub</Text>
                        </TouchableOpacity>
                    ) : null}
                    
                    {project.demoLink ? (
                         <TouchableOpacity style={styles.button} onPress={() => handleLink(project.demoLink)}>
                            <Ionicons name="desktop-outline" size={20} color={COLORS.textPrim} />
                            <Text style={styles.buttonText}>Demo</Text>
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
    marginBottom: 100,
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
      fontSize: 16
  },
  projectsContainer: {
      gap: 20
  },
  emptyText: {
    color: COLORS.textSec,
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(199, 112, 240, 0.2)'
  },
  imageContainer: {
      height: 200,
      width: '100%',
      backgroundColor: 'rgba(0,0,0,0.3)',
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
      top: 10,
      right: 10,
      backgroundColor: 'rgba(255, 68, 68, 0.8)',
      padding: 8,
      borderRadius: 20
  },
  cardBody: {
      padding: 20
  },
  cardTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: COLORS.textPrim,
      marginBottom: 10,
      textAlign: 'center'
  },
  cardDescription: {
      color: COLORS.textPrim,
      textAlign: 'justify',
      marginBottom: 20,
      lineHeight: 20
  },
  buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10
  },
  button: {
      backgroundColor: COLORS.darkPurple,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      gap: 8
  },
  buttonText: {
      color: COLORS.textPrim,
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
