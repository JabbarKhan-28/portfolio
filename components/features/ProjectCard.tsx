import { type Project } from "@/components/modals/AddProjectModal";
import { COLORS } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
              {Platform.OS !== 'web' && (
                  <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              )}
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
                  
                  <View style={styles.cardDivider} />

                  <Text style={[styles.cardDescription, isAndroidOrMobileWeb && { fontSize: 18 }]} numberOfLines={3}>{project.description}</Text>
                  
                  {project.tags && project.tags.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 25 }}>
                          {project.tags.map(tag => (
                              <View key={tag} style={styles.cardTag}>
                                  <Text style={styles.cardTagText}>{tag}</Text>
                              </View>
                          ))}
                      </View>
                  )}

                  <View style={styles.buttonsContainer}>
                      {project.ghLink ? (
                          <TouchableOpacity style={styles.button} onPress={() => handleLink(project.ghLink)}>
                              <Ionicons name="logo-github" size={20} color={COLORS.textHighlight} />
                              <Text style={styles.buttonText}>Source</Text>
                          </TouchableOpacity>
                      ) : null}
                      
                      {project.demoLink ? (
                           <TouchableOpacity style={StyleSheet.flatten([styles.button, styles.demoButton])} onPress={() => handleLink(project.demoLink)}>
                              <Ionicons name="rocket-outline" size={20} color={COLORS.primaryBg} />
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
      borderWidth: 1, 
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(30, 30, 40, 0.4)',
      ...Platform.select({
          web: {
              boxShadow: `0 0 40px ${COLORS.textHighlight}40`,
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
      backgroundColor: 'rgba(56, 189, 248, 0.1)', // Subtle Blue BG
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 100, // Pill shape
      borderWidth: 1,
      borderColor: 'rgba(56, 189, 248, 0.2)'
  },
  cardTagText: {
      color: COLORS.textHighlight,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.5
  },
  cardBody: {
      alignItems: 'center'
  },
  cardTitle: {
      fontSize: Platform.OS === 'android' ? 28 : 26, // Larger title
      fontWeight: '900',
      color: COLORS.textPrim,
      marginBottom: 16,
      textAlign: 'center',
      letterSpacing: -1,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4
  },
  cardDivider: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.textHighlight,
    borderRadius: 2,
    marginBottom: 20
  },
  cardDescription: {
      color: COLORS.textSec, // Slate Muted
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 26,
      fontSize: Platform.OS === 'android' ? 17 : 16,
      fontWeight: '400',
      maxWidth: '90%'
  },
  buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      width: '100%',
      marginTop: 'auto'
  },
  button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16, // Taller buttons
      paddingHorizontal: 24,
      borderRadius: 16, // Less rounded than pill, more like squircle
      borderWidth: 1,
      borderColor: 'rgba(148, 163, 184, 0.3)', 
      backgroundColor: 'transparent',
      gap: 10,
      flex: 1
  },
  demoButton: {
      backgroundColor: COLORS.textHighlight,
      borderColor: COLORS.textHighlight,
      borderWidth: 0,
      shadowColor: COLORS.textHighlight,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8
  },
  buttonText: {
      color: COLORS.textPrim, // White text for Source
      fontWeight: '700',
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: 1
  }
});
