
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import * as Animatable from 'react-native-animatable';

export default function AboutScreen() {
  const { height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

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
      style={[styles.container, scrollViewStyle] as any}
      contentContainerStyle={styles.scrollContent}
      pagingEnabled={!isWeb}
      snapToInterval={isWeb ? undefined : height}
      decelerationRate={isWeb ? "normal" : "fast"}
      snapToAlignment="start"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      
      {/* --- PAGE 1: INTRODUCTION --- */}
      <View style={[styles.page, pageStyle] as any}>
        <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Text style={[styles.headerText, isWeb && styles.webHeader]}>
               Know Who <Text style={styles.purpleText}>I'M</Text>
            </Text>
            
            <View style={styles.cardContainer}>
                 <Text style={[styles.cardText, isWeb && styles.webBodyText]}>
                    Hi everyone! I’m <Text style={styles.purpleText}>Jabbar Khan</Text> from <Text style={styles.purpleText}>Islamabad, Pakistan</Text>.{"\n\n"}
                    I’m a <Text style={styles.purpleText}>React Native Developer</Text> with hands-on experience building responsive cross-platform mobile applications for Android and iOS.{"\n\n"}
                    I am currently pursuing a B.S. in Computer Science (Expected 2028) at <Text style={styles.purpleText}>Sir Syed CASE Institute of Technology</Text>.
                 </Text>
            </View>

           

             {/* Scroll Indicator */}
             <Animatable.View animation="pulse" iterationCount="infinite" style={styles.scrollIndicator}>
                <Text style={styles.scrollText}>Swipe For Skills</Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSec} />
            </Animatable.View>
        </View>
      </View>


      {/* --- PAGE 2: SKILLS & TOOLS --- */}
      <View style={[styles.page, pageStyle] as any}>
         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Text style={[styles.headerText, isWeb && styles.webHeader]}>
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

            <Text style={[styles.headerText, { marginTop: 40 }, isWeb && styles.webHeader]}>
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
      <View style={[styles.page, pageStyle] as any}>
         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Text style={[styles.headerText, { marginBottom: 30 }, isWeb && styles.webHeader]}>
                My <Text style={styles.purpleText}>Journey</Text>
            </Text>
            
            <View style={styles.timelineContainer}>
                {/* Item 1 */}
                <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineYear}>2024 - Present</Text>
                        <Text style={styles.timelineTitle}>Freelance Full Stack Developer</Text>
                        <Text style={styles.timelineDesc}>
                            Building custom mobile apps and web solutions for clients globally. Specializing in React Native performance optimization.
                        </Text>
                    </View>
                </View>
                
                {/* Item 2 */}
                <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineYear}>2023 - 2024</Text>
                        <Text style={styles.timelineTitle}>Open Source Contributor</Text>
                        <Text style={styles.timelineDesc}>
                            Actively contributing to React Native libraries and developer tools. Gained deep understanding of native modules.
                        </Text>
                    </View>
                </View>

                {/* Item 3 */}
                <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineYear}>2024 - 2028 (Expected)</Text>
                        <Text style={styles.timelineTitle}>BS Computer Science</Text>
                        <Text style={styles.timelineDesc}>
                           Sir Syed CASE Institute of Technology. Focusing on Algorithms, AI, and Software Engineering principles.
                        </Text>
                    </View>
                </View>
            </View>
         </View>
      </View>


      {/* --- PAGE 4: PHILOSOPHY --- */}
      <View style={[styles.page, pageStyle] as any}>
         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Text style={[styles.headerText, isWeb && styles.webHeader]}>
                My <Text style={styles.purpleText}>Philosophy</Text>
            </Text>

            <View style={styles.cardContainer}>
                 <Text style={[styles.cardText, isWeb && styles.webBodyText, { textAlign: 'center' }]}>
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
      <View style={[styles.page, pageStyle] as any}>
         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <View style={styles.quoteContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color={COLORS.purple} style={{ opacity: 0.8, marginBottom: 20 }} />
                <Text style={styles.quoteText}>
                    "Strive to build things that make a difference!"
                </Text>
                <Text style={styles.footerText}>- Jabbar Khan</Text>
            </View>

            <Link href="/contact" asChild>
                <TouchableOpacity style={styles.hireBtn}>
                    <Text style={styles.hireBtnText}>Hire Me</Text>
                    <Ionicons name="briefcase-outline" size={20} color={COLORS.primaryBg} />
                </TouchableOpacity>
            </Link>
         </View>
      </View>

    </ScrollView>
  );
}

function SkillBadge({ name }: { name: string }) {
    return (
        <View style={styles.badge}>
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
  },
  page: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20
  },
  contentWrapper: {
      width: '100%',
      maxWidth: 600,
      alignItems: 'center'
  },
  
  // Web Specifics
  webContentCentered: {
      maxWidth: 900
  },
  webHeader: {
      fontSize: 48,
      marginBottom: 40
  },
  webBodyText: {
      fontSize: 20,
      lineHeight: 32
  },

  // Headers
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrim,
    marginBottom: 20,
    textAlign: 'center'
  },
  purpleText: {
    color: COLORS.purple
  },

  // Card / Bio
  cardContainer: {
    backgroundColor: COLORS.cardBg,
    padding: 30,
    borderRadius: 16,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.textHighlight,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
        web: {},
        default: {}
    })
  },
  cardText: {
    color: COLORS.textPrim,
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'justify' // Better reading flow
  },
  imagePlaceholder: {
      width: '100%',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20
  },
  aboutImage: {
    width: 250,
    height: 250,
    borderRadius: 125, // Circle
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },

  
  // Skills
  skillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 15,
      marginTop: 10
  },
  badge: {
      borderColor: COLORS.border,
      borderWidth: 1,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 50, // Pill shape
      backgroundColor: COLORS.surface // Subtle difference
  },
  badgeText: {
      color: COLORS.textPrim,
      fontWeight: '600',
      fontSize: 15
  },

  // Timeline (Journey)
  timelineContainer: {
      width: '100%',
      paddingLeft: 10
  },
  timelineItem: {
      marginLeft: 20,
      borderLeftWidth: 2,
      borderLeftColor: COLORS.border,
      paddingLeft: 25,
      paddingBottom: 45,
      position: 'relative'
  },
  timelineDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: COLORS.textHighlight,
      position: 'absolute',
      left: -8,
      top: 0,
      borderWidth: 2,
      borderColor: COLORS.primaryBg // Create a 'cutout' effect
  },
  timelineContent: {
      alignItems: 'flex-start'
  },
  timelineYear: {
      color: COLORS.purple,
      fontWeight: 'bold',
      marginBottom: 5
  },
  timelineTitle: {
      color: COLORS.textPrim,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5
  },
  timelineDesc: {
      color: COLORS.textSec,
      fontSize: 14,
      lineHeight: 20
  },

  // Quote / Philosophy
  quoteContainer: {
      alignItems: 'center',
      marginVertical: 40
  },
  quoteText: {
    color: COLORS.textSec,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 20,
    marginBottom: 10
  },
  footerText: {
     color: COLORS.purple,
     fontWeight: 'bold'
  },
  hireBtn: {
      backgroundColor: COLORS.textHighlight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 50,
      borderRadius: 50,
      gap: 12,
      elevation: 10,
      ...Platform.select({
          web: { boxShadow: '0 0 20px rgba(72, 202, 228, 0.4)' },
          default: { shadowColor: COLORS.textHighlight, shadowOpacity: 0.5, shadowRadius: 10 }
      })
  },
  hireBtnText: {
      color: COLORS.primaryBg,
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 1
  },

  // Scroll Indicator
  scrollIndicator: {
    position: 'absolute',
    bottom: -50,
    alignSelf: 'center',
    alignItems: 'center'
  },
  scrollText: {
    color: COLORS.textSec,
    fontSize: 12,
    marginBottom: 5
  },
});
