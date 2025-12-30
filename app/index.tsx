import { TypeWriter } from '@/components/TypeWriter';
import { COLORS } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';

import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Treat as "Web Desktop" only if platform is web AND screen is large enough.
  // Otherwise, fallback to mobile/native behaviors.
  const isWeb = Platform.OS === 'web' && width >= 768;
  const isMobile = width < 768;

  // Web-specific styles to enable CSS Scroll Snap
  const scrollViewStyle: any = isWeb ? {
    height: '100vh',
    scrollSnapType: 'y mandatory',
    overflowY: 'scroll'
  } : {};

  const pageStyle: any = isWeb ? {
    height: height,
    minHeight: '100vh',
    scrollSnapAlign: 'start'
  } : {
    // On native, allow flexibility but try to fit screen.
    // If content is too big, pagingEnabled might be tricky, but we'll keep standard behavior.
    height: height,
    paddingTop: insets.top,
    paddingBottom: insets.bottom + 80 // Space for tab bar
  };

  return (
    <ScrollView 
      style={StyleSheet.flatten([styles.container, scrollViewStyle])}
      contentContainerStyle={styles.scrollContent}
      pagingEnabled={!isWeb} // Use native paging on mobile, CSS snap on web
      snapToInterval={isWeb ? undefined : height}
      decelerationRate={isWeb ? "normal" : "fast"}
      snapToAlignment="start"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      
      {/* --- HERO SECTION --- */}
      <View style={StyleSheet.flatten([styles.page, pageStyle])}>

        {/* Abstract Background Glows */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={[styles.heroContent, isWeb && styles.webContentRaw]}>
            <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
                <Text style={[styles.heading, isWeb && styles.webHeading]}>
                Hello, I'm
                </Text>
                <Text style={styles.headingName}>
                <Text style={styles.mainName}>JABBAR KHAN</Text>
                </Text>
            </Animatable.View>
            
            <View style={styles.typeContainer}>
              <TypeWriter 
                  typing={1} 
                  minDelay={50} 
                  maxDelay={150} 
                  style={[styles.typeText, isMobile && { fontSize: 20 }]}
              >
                  Full Stack Developer | React Native Expert | UI/UX Enthusiast
              </TypeWriter>
            </View>

            <Animatable.View 
                animation="pulse" 
                iterationCount="infinite" 
                duration={4000} 
                style={[styles.imageContainer, isMobile && { marginTop: 70 }]}
            >
              <Image
                  source={require('../assets/home-main.png')}
                  style={{
                    width: isWeb ? 280 : (Platform.OS === 'android' ? (width < 380 ? 220 : 260) : (width < 380 ? 180 : 220)),
                    height: isWeb ? 280 : (Platform.OS === 'android' ? (width < 380 ? 220 : 260) : (width < 380 ? 180 : 220)),
                    maxWidth: '80%'
                  }}
                  contentFit="contain"
              />
            </Animatable.View>
            
            {/* Scroll Indicator */}
            <Animatable.View animation="bounce" iterationCount="infinite" duration={2000} style={styles.scrollIndicator}>
                <Text style={styles.scrollText}>Explore My World</Text>
                <Ionicons name="chevron-down" size={24} color={COLORS.textHighlight} />
            </Animatable.View>
        </View>
      </View>

      {/* --- ABOUT PREVIEW --- */}
      <View style={StyleSheet.flatten([styles.page, pageStyle])}>
         {/* Alternating Glows */}
         <View style={styles.glowTopLeft} />
         <View style={styles.glowBottomRight} />

         <Animatable.View animation="fadeInUp" style={StyleSheet.flatten([styles.contentWrapper, isWeb && styles.webContentCentered, isMobile && { padding: 24 }])}>
            <Text style={StyleSheet.flatten([styles.sectionTitle, isWeb && { fontSize: 48 }])}>
              The <Text style={styles.highlight}>Vision</Text>
            </Text>
            <View style={styles.divider} />
            <Text style={StyleSheet.flatten([styles.bodyText, isWeb && styles.webBodyText, isMobile && { fontSize: 18, lineHeight: 28 }])}>
                I bridge the gap between imagination and reality by building 
                <Text style={{color: COLORS.textHighlight, fontWeight: 'bold'}}> seamless digital experiences</Text>. 
                Specializing in the React Native Full stack Development, I focus on performance, 
                scalability, and user-centric design.
            </Text>
            <Link href="/about" asChild>
                <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Discover My Journey</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.textHighlight} />
                </TouchableOpacity>
            </Link>
         </Animatable.View>
      </View>


      {/* --- CONTACT SECTION --- */}
      <View style={StyleSheet.flatten([styles.page, pageStyle])}>
         {/* Alternating Glows (Mix) */}
         <View style={styles.glowTop} />
         <View style={styles.glowBottomRight} />

         <Animatable.View animation="zoomIn" style={[styles.contentWrapper, isWeb && styles.webContentCentered, isMobile && { padding: 24 }]}>
            <Text style={[styles.sectionTitle, isWeb && { fontSize: 48 }]}>
              Let's <Text style={styles.highlight}>Connect</Text>
            </Text>
            <Text style={[styles.bodyText, isWeb && styles.webBodyText, isMobile && { fontSize: 18, lineHeight: 28 }]}>
                Have a groundbreaking idea? Let's turn it into a reality together.
            </Text>
            
            <View style={StyleSheet.flatten([
              styles.contactLinks, 
              isWeb && { width: 'auto', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
              width < 400 && { flexDirection: 'column', width: '100%' }
            ])}>

                <Link href="/contact" asChild>
                    <TouchableOpacity style={StyleSheet.flatten([styles.primaryButton, width < 450 && { width: '100%' }])}>

                        <Ionicons name="mail" size={24} color={COLORS.primaryBg} />
                        <Text style={styles.primaryButtonText}>Email Me</Text>

                    </TouchableOpacity>
                </Link>

                <TouchableOpacity 
                  style={StyleSheet.flatten([styles.primaryButton, width < 450 && { width: '100%' }])} 
                  onPress={() => Linking.openURL('https://github.com/JabbarKhan-28')}
                >
                    <Ionicons name="logo-github" size={24} color={COLORS.primaryBg} />
                    <Text style={styles.primaryButtonText}>Github</Text>

                </TouchableOpacity>

                <TouchableOpacity 
                  style={StyleSheet.flatten([styles.primaryButton, width < 450 && { width: '100%' }])} 
                  onPress={() => Linking.openURL('https://www.linkedin.com/in/jabbar-khan-824868366/')}
                >
                    <Ionicons name="logo-linkedin" size={24} color={COLORS.primaryBg} />
                    <Text style={styles.primaryButtonText}>LinkedIn</Text>

                </TouchableOpacity>

            </View>

            <Link href="/resume" asChild>
                <TouchableOpacity style={StyleSheet.flatten([styles.outlineButton, width < 450 && { width: '100%' }])}>
                    <View style={styles.buttonGlow} />
                    <Ionicons name="document-text-outline" size={22} color={COLORS.accent} />
                    <Text style={styles.outlineButtonText}>View Resume</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.accent} style={{ opacity: 0.5 }} />

                </TouchableOpacity>
            </Link>


         </Animatable.View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  scrollContent: {
      flexGrow: 1,
      // Padding bottom handled by page style
  },
  page: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      position: 'relative',
      overflow: 'hidden'
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowPurple,
    opacity: 0.5,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowCyan,
    opacity: 0.3,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowCyan, // Varied color
    opacity: 0.4,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowPurple, // Varied color
    opacity: 0.4,
  },
  heroContent: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center'
  },
  contentWrapper: {
      width: '100%',
      maxWidth: 600,
      alignItems: 'center',
      // backgroundColor removed
      padding: Platform.OS === 'android' ? 24 : 40,
      borderRadius: 32,
      borderColor: COLORS.border,
      borderWidth: 1.5,
      ...Platform.select({
          web: {
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          } as any,
          default: {
            elevation: 8,
            shadowColor: COLORS.textHighlight,
            shadowOpacity: 0.15,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 }
          }
      })
  },
  divider: {
    width: 50,
    height: 4,
    backgroundColor: COLORS.textHighlight,
    borderRadius: 2,
    marginBottom: 20
  },
  
  // Web Specifics
  webContentRaw: {
      alignItems: 'center', 
      textAlign: 'center'
  },
  webContentCentered: {
      alignItems: 'center',
      maxWidth: 900
  },
  webHeading: {
      fontSize: 52,
      letterSpacing: -1
  },
  webBodyText: {
      textAlign: 'center',
      fontSize: 22,
      lineHeight: 34
  },

  header: {
    alignItems: 'center'
  },
  heading: {
    fontSize: Platform.OS === 'android' ? 28 : 28,

    color: COLORS.textSec,
    fontWeight: '500',
    letterSpacing: 4,
    textTransform: 'uppercase'
  },


  headingName: {
    fontSize: Platform.OS === 'android' ? 38 : 38,

    color: COLORS.textPrim,
    marginTop: 5,
    fontWeight: '900',
    letterSpacing: -1
  },


  mainName: {
    color: COLORS.textPrim,
  },
  typeContainer: {
    marginTop: 10,
    minHeight: 40,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  typeText: {
    color: COLORS.textHighlight,
    fontSize: Platform.OS === 'android' ? 20 : 22,
    fontWeight: '600',
    textAlign: 'center'
  },
  
  imageContainer: {
    marginTop: Platform.OS === 'android' ? 70 : 40,
    marginBottom: 10,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center'
  },
  
  scrollIndicator: {
      marginTop: 20,
      alignItems: 'center'
  },
  scrollText: {
      color: COLORS.textMuted,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      letterSpacing: 1
  },

  // Section Styles
  sectionTitle: {
      fontSize: Platform.OS === 'android' ? 32 : 32,

      fontWeight: '800',
      color: COLORS.textPrim,
      textAlign:'center',
      marginBottom: 10,
      letterSpacing: -0.5

  },

  highlight: {
      color: COLORS.textHighlight
  },
  bodyText: {
      color: COLORS.textSec,
      fontSize: Platform.OS === 'android' ? 18 : 16,
      lineHeight: Platform.OS === 'android' ? 28 : 26,
      marginBottom: 20, 
      textAlign: 'center'

  },

  
  // Buttons
  primaryButton: {
      backgroundColor: COLORS.textHighlight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 20,
      gap: 12,
      elevation: 8,
      shadowColor: COLORS.textHighlight,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)' // Glassy edge effect
  },
  primaryButtonText: {
      color: COLORS.darkBg,
      fontWeight: '900',
      fontSize: 18,
      letterSpacing: 0.5,
      textTransform: 'uppercase'
  },



  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    marginTop: 10
  },
  secondaryButtonText: {
    color: COLORS.textHighlight,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5
  },
  outlineButton: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 212, 191, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
      } as any,
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        // Elevation removed to prevent shadow artifacts through transparent background
        borderWidth: 2, 
      }
    })
  },
  buttonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.accent,
    opacity: 0.03,
  },
  outlineButtonText: {
    color: COLORS.accent,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },



  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border
  },
  
  // Contact section
  contactLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 12,
      width: '100%',
      marginVertical: 15
  }
});
