
import { TypeWriter } from '@/components/TypeWriter';
import { COLORS } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

export default function HomeScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
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
    height: height + (Platform.OS === 'android' ? 0 : 0) // Adjust if needed
  };

  return (
    <ScrollView 
      style={[styles.container, scrollViewStyle] as any}
      contentContainerStyle={styles.scrollContent}
      pagingEnabled={!isWeb} // Use native paging on mobile, CSS snap on web
      snapToInterval={isWeb ? undefined : height}
      decelerationRate={isWeb ? "normal" : "fast"}
      snapToAlignment="start"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      
      {/* --- HERO SECTION --- */}
      <View style={[styles.page, pageStyle] as any}>
        <View style={[styles.heroContent, isWeb && styles.webContentRaw]}>
            <Animatable.View animation="fadeInDown" style={styles.header}>
                <Text style={[styles.heading, isWeb && styles.webHeading]}>
                Hi There!
                </Text>
                <Text style={styles.headingName}>
                I'M <Text style={styles.mainName}>JABBAR KHAN</Text>
                </Text>
            </Animatable.View>
            
            <View style={styles.typeContainer}>
            <TypeWriter 
                typing={1} 
                minDelay={50} 
                maxDelay={150} 
                style={styles.typeText}
            >
                Full Stack Developer | React Native | React 
            </TypeWriter>
            </View>

            <Animatable.View animation="fadeInUp" style={styles.imageContainer}>
            <Image
                source={require('../assets/home-main.svg')}
                style={styles.homeImage}
                contentFit="contain"
            />
            </Animatable.View>
            
            {/* Scroll Indicator */}
            <Animatable.View animation="pulse" iterationCount="infinite" style={styles.scrollIndicator}>
                <Text style={styles.scrollText}>Swipe Down</Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSec} />
            </Animatable.View>
        </View>
      </View>

      {/* --- ABOUT PREVIEW --- */}
      <View style={[styles.page, pageStyle] as any}>
         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Text style={[styles.sectionTitle, isWeb && { fontSize: 42 }]}>Brief <Text style={styles.highlight}>Intro</Text></Text>
            <Text style={[styles.bodyText, isWeb && styles.webBodyText]}>
                I am a passionate Full Stack Developer with a knack for crafting robust and scalable applications. 
                With expertise in React Native, React.js, and Node.js, I specialize in building seamless mobile and web experiences that delight users.
                
                My journey involves solving complex problems, optimizing performance, and contributing to open-source projects. 
                I believe in clean code, continuous learning, and the power of technology to transform ideas into reality.
            </Text>
            <Link href="/about" asChild>
                <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>More About Me</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.textPrim} />
                </TouchableOpacity>
            </Link>
         </View>
      </View>

     
      {/* --- CONTACT SECTION --- */}
      <View style={[styles.page, pageStyle] as any}>
         <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
            <Text style={[styles.sectionTitle, isWeb && { fontSize: 42 }]}>Get In <Text style={styles.highlight}>Touch</Text></Text>
            <Text style={[styles.bodyText, isWeb && styles.webBodyText]}>
                Whether you have a question, a project idea, or just want to say hi, I'll try my best to get back to you!
            </Text>
            
            <View style={[styles.contactLinks, isWeb && { width: 'auto', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
                <Link href="/contact" asChild>
                    <TouchableOpacity style={styles.contactItem}>
                        <Ionicons name="mail" size={24} color={COLORS.purple} />
                        <Text style={styles.contactText}>Email Me</Text>
                    </TouchableOpacity>
                </Link>

                <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('https://github.com/JabbarKhan-28')}>
                    <Ionicons name="logo-github" size={24} color={COLORS.purple} />
                    <Text style={styles.contactText}>GitHub</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('https://linkedin.com')}>
                    <Ionicons name="logo-linkedin" size={24} color={COLORS.purple} />
                    <Text style={styles.contactText}>LinkedIn</Text>
                </TouchableOpacity>
            </View>

            <Link href="/resume" asChild>
                <TouchableOpacity style={{ ...styles.primaryButton, marginTop: 30, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.textHighlight }}>
                    <Ionicons name="document-text-outline" size={20} color={COLORS.textHighlight} />
                    <Text style={{ ...styles.primaryButtonText, color: COLORS.textHighlight }}>View My Resume</Text>
                </TouchableOpacity>
            </Link>
         </View>
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
      paddingBottom: 100,
  },
  page: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 60 // Space for tab bar
  },
  heroContent: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'flex-start'
  },
  contentWrapper: {
      width: '100%',
      maxWidth: 600,
      alignItems: 'flex-start',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      padding: 30,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      ...Platform.select({
          web: { backdropFilter: 'blur(4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
          default: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 }
      })
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
      fontSize: 48
  },
  webBodyText: {
      textAlign: 'center',
      fontSize: 22,
      lineHeight: 34
  },

  header: {
    marginLeft: 10
  },
  heading: {
    fontSize: 35,
    color: COLORS.textPrim,
    fontWeight: '700',
  },
  headingName: {
    fontSize: 35,
    color: COLORS.textPrim,
    marginTop: 10,
    fontWeight: '700',
  },
  mainName: {
    color: COLORS.textHighlight,
  },
  typeContainer: {
    marginTop: 20,
    marginLeft: 10,
    height: 60
  },
  typeText: {
    color: COLORS.textHighlight,
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center'
  },
  homeImage: {
      width: 280,
      height: 280
  },
  scrollIndicator: {
      position: 'absolute',
      bottom: -40,
      alignSelf: 'center',
      alignItems: 'center'
  },
  scrollText: {
      color: COLORS.textSec,
      fontSize: 12,
      marginBottom: 5
  },
  
  // Section Styles
  sectionTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.textPrim,
      textAlign:'center',
      alignContent:'center',
      alignItems:'center',
      justifyContent:'center',
      marginBottom: 15
  },
  highlight: {
      color: COLORS.purple
  },
  bodyText: {
      color: COLORS.textSec,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 20,
      textAlign: 'justify'
  },
  
  // Buttons
  primaryButton: {
      backgroundColor: COLORS.textHighlight,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderRadius: 50, // Pill shape
      gap: 10,
      alignSelf:'center',
      elevation: 5,
      marginTop: 10
  },
  primaryButtonText: {
      color: COLORS.primaryBg,
      fontWeight: 'bold',
      fontSize: 16
  },
  
  // Contact section
  contactLinks: {
      gap: 15,
      width: '100%',
      marginBottom: 10
  },
  contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 15,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  contactText: {
      color: COLORS.textPrim,
      alignSelf:'center',
      textAlign:'center',
      fontWeight:'bold',
      alignItems:'center',
      justifyContent:'center',
      fontSize: 16
  }
});
