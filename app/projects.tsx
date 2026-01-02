
import AddProjectModal, { type Project } from "@/components/AddProjectModal";
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
import { ActivityIndicator, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

import * as Animatable from 'react-native-animatable';

export default function ProjectsScreen() {
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
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
        <ScrollView contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        >
        <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
                 <View style={{ width: 40 }} /> 
                 {/* Spacer to center the title */}

                <TouchableOpacity activeOpacity={1} onPress={handleSecretLogin}>
                    <Text style={[styles.headerText, isDesktopWeb && styles.webHeader]}>
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

function ProjectCardWrapper({ children, index, itemWidth }: { children: React.ReactNode, index: number, itemWidth: number }) {
    return (
        <Animatable.View 
            animation="fadeInUp"
            duration={800}
            delay={index * 100}
            style={{ width: itemWidth }}
        >
            {children}
        </Animatable.View>
    );
}

function ProjectCard({ project, onDelete, onEdit, isMobileWeb, isAndroidOrMobileWeb }: { project: Project, onDelete?: () => void, onEdit?: () => void, isMobileWeb: boolean, isAndroidOrMobileWeb: boolean }) {
    const { width } = useWindowDimensions();

    const handleLink = (url: string) => {
        if (url) {
            Haptics.selectionAsync();
            Linking.openURL(url);
        }
    }

    const [imgSource, setImgSource] = useState(
        project.imageUrl ? { uri: project.imageUrl } : require('../assets/project.jpg')
    );


    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.cardContainer}>
          <View style={[
              styles.card,
              isMobileWeb && {
                  boxShadow: 'none',
                  backdropFilter: 'none',
                  transition: 'none',
                  borderWidth: 1.5,
                  shadowColor: COLORS.textHighlight,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
              } as any
          ]}>
              {/* Image Container with Overlay */}
              <View style={StyleSheet.flatten([styles.imageContainer, { height: width < 400 ? 180 : 220 }])}>




                   <Image 
                      source={imgSource}
                      style={styles.projectImage} 
                      contentFit="cover" 
                      transition={500}
                      onError={() => setImgSource(require('../assets/project.jpg'))} 
                   />
                   <View style={styles.imageOverlay} />
                   
                   {/* Admin Actions */}
                   {onDelete && onEdit && (
                       <View style={styles.adminActions}>
                           <TouchableOpacity style={StyleSheet.flatten([styles.actionBtn, { backgroundColor: COLORS.textHighlight }])} onPress={onEdit}>
                               <Ionicons name="create" size={16} color={COLORS.primaryBg} />
                           </TouchableOpacity>
                           <TouchableOpacity style={StyleSheet.flatten([styles.actionBtn, { backgroundColor: COLORS.error }])} onPress={onDelete}>
                               <Ionicons name="trash" size={16} color="#FFF" />
                           </TouchableOpacity>
                       </View>

                   )}
              </View>
              
              <View style={StyleSheet.flatten([styles.cardBody, { padding: width < 400 ? 16 : 24 }])}>




                  <Text style={[styles.cardTitle, isAndroidOrMobileWeb && { fontSize: 26 }]}>{project.title}</Text>
                  
                  {project.tags && project.tags.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
                          {project.tags.map(tag => (
                              <View key={tag} style={styles.cardTag}>
                                  <Text style={styles.cardTagText}>{tag}</Text>
                              </View>
                          ))}
                      </View>
                  )}

                  <View style={styles.cardDivider} />
                  <Text style={[styles.cardDescription, isAndroidOrMobileWeb && { fontSize: 18 }]} numberOfLines={3}>{project.description}</Text>
                  
                  <View style={styles.buttonsContainer}>
                      {project.ghLink ? (
                          <TouchableOpacity style={styles.button} onPress={() => handleLink(project.ghLink)}>
                              <Ionicons name="logo-github" size={18} color={COLORS.textHighlight} />
                              <Text style={styles.buttonText}>Source</Text>
                          </TouchableOpacity>
                      ) : null}
                      
                      {project.demoLink ? (
                           <TouchableOpacity style={StyleSheet.flatten([styles.button, styles.demoButton])} onPress={() => handleLink(project.demoLink)}>
                              <Ionicons name="rocket-outline" size={18} color={COLORS.primaryBg} />
                              <Text style={[styles.buttonText, { color: COLORS.primaryBg }]}>Live Demo</Text>
                          </TouchableOpacity>
                      ) : null}
                  </View>
              </View>
          </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -100, // Shift to Left
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowPurple,
    opacity: 0.5,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    right: -100, // Shift to Right
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowCyan,
    opacity: 0.3,
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 40,
    paddingBottom: 120
  },


  headerContainer: {
      alignItems: 'center',
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
  webHeader: {
      fontSize: 52,
      lineHeight: 58
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
      gap: 25, // Increased gap for premium feel
      justifyContent: 'center'
  },
  emptyText: {
    color: COLORS.textSec,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18
  },
  cardContainer: {
    marginBottom: 20 // Adjusted margin for itemWidth calculation
  },
  card: {
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
  imageContainer: {
      width: '100%',
      backgroundColor: COLORS.darkBg,
      position: 'relative',
      overflow: 'hidden'
  },
  projectImage: {
      width: '100%',
      height: '100%'
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 0, 51, 0.1)'
  },
  adminActions: {
      position: 'absolute',
      top: 15,
      right: 15,
      flexDirection: 'row',
      gap: 10,
      zIndex: 10
  },
  actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  cardTag: {
      backgroundColor: 'rgba(45, 212, 191, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(45, 212, 191, 0.3)'
  },
  cardTagText: {
      color: COLORS.textHighlight,
      fontSize: 12,
      fontWeight: 'bold'
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
  cardBody: {
      alignItems: 'center'
  },
  cardTitle: {
      fontSize: Platform.OS === 'android' ? 26 : 24,

      fontWeight: '800',
      color: COLORS.textPrim,
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: -0.5
  },



  cardDivider: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.textHighlight,
    borderRadius: 2,
    marginBottom: 15
  },
  cardDescription: {
      color: COLORS.textSec,
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 24,
      fontSize: Platform.OS === 'android' ? 18 : 16,

      height: 72
  },


  buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
      width: '100%'
  },
  button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: 'rgba(45, 212, 191, 0.3)', // Teal outline matches Resume
      backgroundColor: 'rgba(45, 212, 191, 0.05)',
      gap: 8,
      flex: 1
  },
  demoButton: {
      backgroundColor: COLORS.textHighlight,
      borderColor: COLORS.textHighlight,
      borderWidth: 0,
      shadowColor: COLORS.textHighlight,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5
  },
  buttonText: {
      color: COLORS.textHighlight,
      fontWeight: '900',
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: 1
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

