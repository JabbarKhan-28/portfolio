import AddProjectModal, { type Project } from "@/components/modals/AddProjectModal";
import CustomAlertModal, { AlertType } from "@/components/modals/CustomAlertModal";
import BackgroundGlows from "@/components/ui/BackgroundGlows";
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProjectCard, { ProjectCardWrapper } from "@/components/features/ProjectCard";


export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  
  // Treat "Web" styling only for Desktop. Mobile Web should feel like Native/Android.
  const isDesktopWeb = Platform.OS === 'web' && width >= 768;
  const isMobileWeb = Platform.OS === 'web' && width < 768;
  const isAndroidOrMobileWeb = Platform.OS === 'android' || isMobileWeb;
  
   // Calculate dynamic card width
  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;
  const horizontalPadding = 20;
  const gap = 25;
  const itemWidth = (width - horizontalPadding * 2 - (numColumns - 1) * gap) / numColumns;


  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  
  const [selectedTag, setSelectedTag] = useState("All");

  const allTags = React.useMemo(() => {
    const tags = new Set<string>(["All"]);
    projects.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [projects]);

  const filteredProjects = React.useMemo(() => {
    if (selectedTag === "All") return projects;
    return projects.filter(p => p.tags?.includes(selectedTag));
  }, [projects, selectedTag]);

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

  /* ------------------ AUTH STATE ------------------ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  /* ------------------ SECRET LOGIN (5 TAPS) ------------------ */
  const [secretTaps, setSecretTaps] = useState(0);

  const handleSecretLogin = () => {
    if (user) {
        return; 
    };

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

  const handleEdit = (project: Project) => {
      Haptics.selectionAsync();
      setEditingProject(project);
      setModalVisible(true);
  }

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
      setEditingProject(null);
      setModalVisible(true);
  }

  return (
    <View style={styles.container}>
      {/* Background Glows */}
      <BackgroundGlows top bottom />
        <ScrollView contentContainerStyle={[
            styles.contentContainer,
            { 
              paddingTop: (Platform.OS === 'web' && width >= 768) ? 140 : insets.top + 5,
              paddingBottom: insets.bottom + 100 
            }
        ]}
        showsVerticalScrollIndicator={false}
        >
        <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
                {/* Title Centered */}
                <TouchableOpacity activeOpacity={1} onPress={handleSecretLogin} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[styles.headerText, isDesktopWeb && styles.webHeader]}>
                        My Recent <Text style={styles.purpleText}>Works</Text>
                    </Text>
                </TouchableOpacity>

                {/* Logout Button Absolute Right */}
                {user && (
                    <View style={{ position: 'absolute', right: 0 }}>
                        <TouchableOpacity onPress={handleLogout} style={{ padding: 5 }}>
                            <Ionicons name="log-out-outline" size={24} color={COLORS.textSec} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <Text style={[styles.subText, isMobileWeb && { fontSize: 18 }]}>Here are a few projects I've worked on recently.</Text>
            
            {/* Tag Filter */}
            {!loading && projects.length > 0 && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ gap: 10, paddingVertical: 10, paddingHorizontal: 5 }}
                    style={{ marginTop: 20, maxHeight: 60 }}
                >
                    {allTags.map(tag => (
                        <TouchableOpacity 
                            key={tag} 
                            onPress={() => {
                                Haptics.selectionAsync();
                                setSelectedTag(tag);
                            }}
                            style={[
                                styles.filterChip, 
                                selectedTag === tag && styles.activeFilterChip
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedTag === tag && styles.activeFilterText
                            ]}>
                                {tag}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>

        {loading ? (
            <ActivityIndicator size="large" color={COLORS.purple} style={{ marginTop: 50 }} />
        ) : (
            <View style={styles.projectsContainer}>
                {filteredProjects.length === 0 ? (
                    <Text style={styles.emptyText}>No projects found for "{selectedTag}".</Text>
                ) : (
                    filteredProjects.map((project, index) => (
                        <ProjectCardWrapper key={project.id} index={index} itemWidth={itemWidth}>
                            <ProjectCard 
                                project={project} 
                                onDelete={user ? () => handleDelete(project.id) : undefined} 
                                onEdit={user ? () => handleEdit(project) : undefined}
                                isMobileWeb={isMobileWeb}
                                isAndroidOrMobileWeb={isAndroidOrMobileWeb}
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
            onClose={() => { setModalVisible(false); setEditingProject(null); }} 
            projectToEdit={editingProject}
            onSuccess={() => {
                showAlert('success', 'Success!', `Project ${editingProject ? 'updated' : 'added'} successfully.`);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },


  // Glows removed - used BackgroundGlows component
  contentContainer: {
    padding: 20,
  },


  headerContainer: {
      alignItems: 'center',
      marginBottom: 40
  },
  headerRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    width: "100%", 
    alignItems: "center",
    position: 'relative'
    },
  headerText: {
    fontSize: Platform.OS === 'android' ? 36 : 46,
    fontWeight: "900",
    color: COLORS.textPrim,
    textAlign: "center",
    letterSpacing: -2,
    lineHeight: Platform.OS === 'android' ? 48 : 46,
    textShadowColor: COLORS.glowPurple, // Consistent Blue Glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  webHeader: {
      fontSize: 64,
      lineHeight: 72,
      letterSpacing: -3,
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


  projectsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 30, // Increased gap for premium feel
      justifyContent: 'center'
  },
  emptyText: {
    color: COLORS.textSec,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18
  },
  filterChip: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: COLORS.cardBg,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginRight: 5
  },
  activeFilterChip: {
      backgroundColor: COLORS.textHighlight,
      borderColor: COLORS.textHighlight
  },
  filterText: {
      color: COLORS.textSec,
      fontWeight: '600',
      fontSize: 14
  },
  activeFilterText: {
      color: COLORS.primaryBg,
      fontWeight: 'bold'
  },
  fabContainer: {
      position: 'absolute',
      bottom: 110,
      right: 25,
  },
  fab: {
    backgroundColor: COLORS.textHighlight,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.textHighlight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  }
});
