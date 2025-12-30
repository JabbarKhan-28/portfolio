import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

import { Link } from "expo-router";
import React from "react";
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

import * as Animatable from 'react-native-animatable';

export default function AboutScreen() {
  const { height, width } = useWindowDimensions();
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
    height: height
  };

  return (
    <ScrollView 
      style={StyleSheet.flatten([styles.container, scrollViewStyle])}

      contentContainerStyle={styles.scrollContent}
      pagingEnabled={!isWeb}
      snapToInterval={isWeb ? undefined : height}
      decelerationRate={isWeb ? "normal" : "fast"}
      snapToAlignment="start"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      
      {/* --- PAGE 1: INTRODUCTION --- */}
      <View style={StyleSheet.flatten([styles.page, pageStyle])}>

        <View style={styles.glowTop} />
        <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Animatable.View animation="fadeInDown" style={styles.headerTextContainer}>
              <Text style={StyleSheet.flatten([styles.headerText, isWeb && styles.webHeader])}>

                 Know Who <Text style={styles.purpleText}>I'M</Text>
              </Text>
              <View style={styles.divider} />
            </Animatable.View>
            
            <Animatable.View animation="fadeInUp" delay={200} style={StyleSheet.flatten([styles.cardContainer, { padding: width < 450 ? 20 : 35 }])}>
                 <Text style={StyleSheet.flatten([styles.cardText, isWeb && styles.webBodyText])}>



                    Hello! I'm <Text style={styles.highlightText}>Jabbar Khan</Text>, a developer based in <Text style={styles.highlightText}>Islamabad, Pakistan</Text> with a vision to build powerful digital solutions.{"\n\n"}
                    I specialize in <Text style={styles.highlightText}>React Native</Text>, creating high-performance, beautiful mobile apps that feel native on every platform.{"\n\n"}
                    Currently pursuing a BS in Computer Science at <Text style={styles.highlightText}>Sir Syed CASE Institute of Technology</Text> (2024-2028).
                 </Text>
            </Animatable.View>

             {/* Scroll Indicator */}
             <Animatable.View animation="bounce" iterationCount="infinite" duration={2000} style={styles.scrollIndicator}>
                <Text style={styles.scrollText}>Swipe For Skills</Text>
                <Ionicons name="chevron-down" size={24} color={COLORS.textHighlight} />
            </Animatable.View>
        </View>
      </View>


      {/* --- PAGE 2: SKILLS & TOOLS --- */}
      <View style={StyleSheet.flatten([styles.page, pageStyle])}>
         <View style={styles.glowTopLeft} />
         <View style={styles.glowBottomRight} />

         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Text style={StyleSheet.flatten([styles.headerText, isWeb && styles.webHeader])}>

                Professional <Text style={styles.purpleText}>Skillset</Text>
            </Text>
            
            <View style={styles.skillRow}>
                <SkillBadge name="React Native" />
                <SkillBadge name="Typescript" />
                <SkillBadge name="Javascript" />
                <SkillBadge name="Node.js" />
                <SkillBadge name="Babel" />
                <SkillBadge name="Firebase" />
                <SkillBadge name="Vercel"/>
                <SkillBadge name="PostgreSQL" />
                <SkillBadge name="C++" />
                <SkillBadge name="Python" />
            </View>

            <Text style={StyleSheet.flatten([styles.headerText, { marginTop: 40 }, isWeb && styles.webHeader])}>

               <Text style={styles.purpleText}>Tools</Text> I use
            </Text>
            <View style={styles.skillRow}>
                <SkillBadge name="VS Code" />
                <SkillBadge name="Postman" />
                <SkillBadge name="Git" />
                <SkillBadge name="Github" />
                <SkillBadge name="Expo" />
                <SkillBadge name="Figma" />
                <SkillBadge name="Adobe Illustrator" />
            </View>
         </View>
      </View>


      {/* --- PAGE 3: JOURNEY (Experience/Education) --- */}
      <View style={StyleSheet.flatten([styles.page, pageStyle])}>

         {/* Background Node Glows */}
         <View style={StyleSheet.flatten([styles.glowBottom, { top: '30%', right: -150, opacity: 0.1 }])} />

         
         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Animatable.View animation="fadeInDown" style={styles.headerTextContainer}>
                <Text style={StyleSheet.flatten([styles.headerText, isWeb && styles.webHeader])}>

                    My <Text style={styles.purpleText}>Journey</Text>
                </Text>
                <View style={styles.divider} />
            </Animatable.View>
            
            <View style={styles.timelineContainer}>
                {/* Item 1 */}
                <Animatable.View animation="fadeInLeft" delay={100} style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                        <Ionicons name="briefcase" size={12} color={COLORS.primaryBg} />
                    </View>
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineYear}>2024 - Present</Text>
                        <Text style={styles.timelineTitle}>Freelance Full Stack Developer</Text>
                        <Text style={styles.timelineDesc}>
                            Building custom mobile apps and web solutions for clients globally. Specializing in React Native performance.
                        </Text>
                    </View>
                </Animatable.View>
                
                {/* Item 2 */}
                <Animatable.View animation="fadeInLeft" delay={300} style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                        <Ionicons name="code-slash" size={12} color={COLORS.primaryBg} />
                    </View>
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineYear}>2023 - 2024</Text>
                        <Text style={styles.timelineTitle}>Open Source Contributor</Text>
                        <Text style={styles.timelineDesc}>
                            Actively contributing to React Native libraries and developer tools. Gained deep understanding of native modules.
                        </Text>
                    </View>
                </Animatable.View>

                {/* Item 3 */}
                <Animatable.View animation="fadeInLeft" delay={500} style={StyleSheet.flatten([styles.timelineItem, { borderLeftWidth: 0, paddingBottom: 0 }])}>

                    <View style={styles.timelineDot}>
                        <Ionicons name="school" size={12} color={COLORS.primaryBg} />
                    </View>
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineYear}>2024 - 2028 (Expected)</Text>
                        <Text style={styles.timelineTitle}>BS Computer Science</Text>
                        <Text style={styles.timelineDesc}>
                           Sir Syed CASE Institute of Technology. Algorithms, AI, and Software Engineering principles.
                        </Text>
                    </View>
                </Animatable.View>
            </View>
         </View>
      </View>


      {/* --- PAGE 4: PHILOSOPHY --- */}
      <View style={StyleSheet.flatten([styles.page, pageStyle])}>
         <View style={styles.glowTopLeft} />

         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Text style={StyleSheet.flatten([styles.headerText, isWeb && styles.webHeader])}>

                My <Text style={styles.purpleText}>Philosophy</Text>
            </Text>

            <View style={StyleSheet.flatten([styles.cardContainer, { padding: width < 450 ? 20 : 35 }])}>



                 <Text style={StyleSheet.flatten([styles.cardText, isWeb && styles.webBodyText, { textAlign: 'center' }])}>

                    I believe that code is more than just instructions for a machine; it's a medium for solving real-world problems and improving lives.
                    {"\n\n"}
                    Every bug is a lesson, and every successful build is a stepping stone. I strive to write clean, maintainable code that stands the test of time.
                 </Text>
            </View>
            
            <Animatable.View animation="pulse" iterationCount="infinite" style={{ marginTop: 20 }}>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSec} />
            </Animatable.View>
         </View>
      </View>

      {/* --- PAGE 5: QUOTE & CTA --- */}
      <View style={StyleSheet.flatten([styles.page, pageStyle])}>
         <View style={styles.glowBottomRight} />

         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <View style={StyleSheet.flatten([styles.quoteContainer, { padding: width < 450 ? 20 : 30 }])}>

                <Ionicons name="chatbubble-ellipses-outline" size={40} color={COLORS.purple} style={{ opacity: 0.8, marginBottom: 20 }} />
                <Text style={StyleSheet.flatten([styles.quoteText, { fontSize: width < 450 ? 18 : 22, lineHeight: width < 450 ? 28 : 32 }])}>



                    "Strive to build things that make a difference!"
                </Text>
                <Text style={styles.footerText}>- Jabbar Khan</Text>
            </View>

            <Link href="/contact" asChild>
                <TouchableOpacity style={StyleSheet.flatten([styles.hireBtn, { paddingVertical: width < 450 ? 15 : 18, paddingHorizontal: width < 450 ? 40 : 64 }])}>

                    <Text style={StyleSheet.flatten([styles.hireBtnText, { fontSize: 18 }])}>Hire Me</Text>


                    <Ionicons name="briefcase-outline" size={20} color={COLORS.primaryBg} />
                </TouchableOpacity>

            </Link>
         </View>
      </View>

    </ScrollView>
  );
}

function SkillBadge({ name }: { name: string }) {
    const { width } = useWindowDimensions();
    return (
        <View style={StyleSheet.flatten([styles.badge, { 
          paddingVertical: width < 450 ? 8 : 12,
          paddingHorizontal: width < 450 ? 14 : 20,
          minWidth: width < 450 ? 80 : 100
        }])}>




            <Text style={styles.badgeText}>{name}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Safe space for tab bar
  },
  page: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingTop: Platform.OS === 'web' ? 80 : (StatusBar.currentHeight || 0) + 20,
      paddingBottom: Platform.OS === 'web' ? 120 : 100, 
 
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
    backgroundColor: COLORS.glowCyan,
    opacity: 0.5,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.glowPurple,
    opacity: 0.3,
  },
  contentWrapper: {
      width: '100%',
      maxWidth: 600,
      alignItems: 'center'
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  divider: {
    width: 50,
    height: 4,
    backgroundColor: COLORS.textHighlight,
    borderRadius: 2,
    marginTop: 10
  },
  
  // Web Specifics
  webContentCentered: {
      maxWidth: 900
  },
  webHeader: {
      fontSize: 52,
      marginBottom: 20
  },
  webBodyText: {
      fontSize: 22,
      lineHeight: 34
  },

  // Headers
  headerText: {
    fontSize: Platform.OS === 'android' ? 36 : 34,

    fontWeight: '900',
    color: COLORS.textPrim,
    textAlign: 'center',
    letterSpacing: -1
  },


  purpleText: {
    color: COLORS.textHighlight
  },

  // Card / Bio
  cardContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 32,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...Platform.select({
        web: {
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        } as any,
        default: {
          elevation: 8,
          shadowColor: COLORS.textHighlight,
          shadowOpacity: 0.15,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 8 }
        }
    })
  },
  highlightText: {
    color: COLORS.textHighlight,
    fontWeight: '800'
  },
  cardText: {
    color: COLORS.textSec,
    fontSize: Platform.OS === 'android' ? 18 : 16,
    lineHeight: Platform.OS === 'android' ? 24 : 26,
    textAlign: 'center'
  },


  
  // Skills
  skillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 12,
      marginTop: 10,
      width: '100%'
  },
  badge: {
      backgroundColor: 'rgba(45, 212, 191, 0.1)', // Cyan tint for better visual
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(45, 212, 191, 0.2)',
      alignItems: 'center'
  },
  badgeText: {
      color: COLORS.textPrim,
      fontWeight: '700',
      fontSize: 15
  },

  // Timeline (Journey)
  timelineContainer: {
      width: '100%',
      paddingLeft: 10,
      marginTop: 20
  },
  timelineItem: {
      marginLeft: 20,
      borderLeftWidth: 2,
      borderLeftColor: COLORS.border,
      paddingLeft: 20,
      paddingBottom: 20, // Reduced spacing
      position: 'relative'
  },
  timelineDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: COLORS.textHighlight,
      position: 'absolute',
      left: -15,
      top: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: COLORS.primaryBg,
      zIndex: 10,
      shadowColor: COLORS.textHighlight,
      shadowOpacity: 0.8,
      shadowRadius: 8,
      elevation: 5
  },
  timelineContent: {
      alignItems: 'flex-start',
      backgroundColor: COLORS.cardBg,
      padding: 12, // Compact padding
      borderRadius: 16,
      borderWidth: 1.2,
      borderColor: COLORS.border,
      width: '100%',
      ...Platform.select({
        web: {
          backdropFilter: 'blur(10px)',
          boxShadow: '0 6px 24px 0 rgba(0, 0, 0, 0.4)'
        } as any
      })
  },
  timelineYear: {
      color: COLORS.textHighlight,
      fontWeight: '900',
      fontSize: Platform.OS === 'android' ? 13 : 12,

      marginBottom: 2,
      letterSpacing: 1,
      textTransform: 'uppercase'
  },

  timelineTitle: {
      color: COLORS.textPrim,
      fontSize: Platform.OS === 'android' ? 18 : 16,

      fontWeight: '800',
      marginBottom: 5
  },

  timelineDesc: {
      color: COLORS.textSec,
      fontSize: Platform.OS === 'android' ? 14 : 13,

      lineHeight: 20
  },



  // Quote / Philosophy
  quoteContainer: {
      alignItems: 'center',
      marginVertical: 40,
      padding: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 30,
      width: '100%'
  },
  quoteText: {
    color: COLORS.textPrim,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: Platform.OS === 'android' ? 24 : 22,

    fontWeight: '500',
    lineHeight: 32,
    marginBottom: 15
  },


  footerText: {
     color: COLORS.textHighlight,
     fontWeight: '900',
     letterSpacing: 1
  },
  hireBtn: {
      backgroundColor: COLORS.textHighlight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 64,
      borderRadius: 24,
      gap: 15,
      elevation: 12,
      shadowColor: COLORS.textHighlight,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 15
  },
  hireBtnText: {
      color: COLORS.darkBg,
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 2,
      textTransform: 'uppercase'
  },


  // Scroll Indicator
  scrollIndicator: {
    position: 'absolute',
    bottom: -60,
    alignSelf: 'center',
    alignItems: 'center'
  },
  scrollText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1
  },
});
