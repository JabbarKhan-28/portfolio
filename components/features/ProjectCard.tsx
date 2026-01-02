import { type Project } from "@/components/modals/AddProjectModal";
import { COLORS } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

export function ProjectCardWrapper({ children, index, itemWidth }: { children: React.ReactNode, index: number, itemWidth: number }) {
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

export default function ProjectCard({ project, onDelete, onEdit, isMobileWeb, isAndroidOrMobileWeb }: { project: Project, onDelete?: () => void, onEdit?: () => void, isMobileWeb: boolean, isAndroidOrMobileWeb: boolean }) {
    const { width } = useWindowDimensions();

    const handleLink = (url: string) => {
        if (url) {
            Haptics.selectionAsync();
            Linking.openURL(url);
        }
    }

    const [imgSource, setImgSource] = useState(
        project.imageUrl ? { uri: project.imageUrl } : require('@/assets/project.jpg')
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
                      onError={() => setImgSource(require('@/assets/project.jpg'))} 
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
  cardContainer: {
    marginBottom: 20 
  },
  card: {
      borderRadius: 32, 
      overflow: "hidden", 
      borderWidth: 1.5, 
      borderColor: COLORS.border,
      backgroundColor: COLORS.cardBg,
      ...Platform.select({
          web: {
              boxShadow: '0 10px 40px 0 rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          } as any,

          default: {
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
      borderColor: 'rgba(45, 212, 191, 0.3)', 
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
  }
});
