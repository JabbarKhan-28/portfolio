
import { COLORS } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

const RESUME_URL = "https://github.com/JabbarKhan-28/Portfolio/raw/main/src/Assets/Jabbar_khan_resume.pdf";

export default function ResumeScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const showPdf = isWeb && width > 768; // Only show PDF embed on desktop web

  const handleDownload = () => {
    Linking.openURL(RESUME_URL);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
        
        <View style={styles.headerSection}>
             <Text style={[styles.headerText, isWeb && styles.webHeader]}>My <Text style={styles.purpleText}>Resume</Text></Text>
             <Text style={styles.subText}>
                Check out my resume below or download it for later.
             </Text>

            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
                <Text style={styles.btnText}>Download CV</Text>
                <Ionicons name="cloud-download-outline" size={20} color={COLORS.textPrim} />
            </TouchableOpacity>
        </View>

        {showPdf ? (
            <View style={styles.pdfContainer}>
                 <iframe 
                    src={RESUME_URL} 
                    style={{ width: '100%', height: '100%', border: 'none' }} 
                    title="Resume PDF"
                 />
            </View>
        ) : (
             <ScrollView 
                style={styles.digitalResumeScroll} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
             >
                 {/* DIGITAL RESUME VIEW FOR MOBILE/SMALL SCREEN */}
                 
                 {/* Summary */}
                 <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Summary</Text>
                     <Text style={styles.bodyText}>
                        Passionate React Native Developer with a strong foundation in building cross-platform mobile applications. Experienced in creating responsive, high-performance apps using modern technologies. Currently pursuing a BS in Computer Science.
                     </Text>
                 </View>

                 {/* Experience */}
                 <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Experience</Text>
                     
                     <ResumeItem 
                        role="Freelance Full Stack Developer"
                        company="Self-Employed"
                        date="2024 - Present"
                        desc="Developing custom mobile and web solutions for clients. Focusing on React Native ecosystem and scalable backend integrations."
                     />
                      <ResumeItem 
                        role="Open Source Contributor"
                        company="GitHub"
                        date="2023 - 2024"
                        desc="Contributing to various React Native libraries, fixing bugs, and improving documentation."
                     />
                 </View>

                 {/* Education */}
                 <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Education</Text>
                     <ResumeItem 
                        role="BS Computer Science"
                        company="Sir Syed CASE Institute of Technology"
                        date="2024 - 2028 (Expected)"
                        desc="Relevant Coursework: Data Structures, Algorithms, OOP, Database Systems."
                     />
                 </View>

                  {/* Skills */}
                  <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Technical Skills</Text>
                     <View style={styles.skillWrap}>
                        <Text style={styles.skillBadges}>React Native • TypeScript • JavaScript • Node.js • Firebase • Git • UI/UX Design</Text>
                     </View>
                 </View>

             </ScrollView>
        )}

      </View>
    </View>
  );
}

function ResumeItem({ role, company, date, desc }: { role: string, company: string, date: string, desc: string }) {
    return (
        <View style={styles.resumeItem}>
            <Text style={styles.itemRole}>{role}</Text>
            <View style={styles.itemMeta}>
                <Text style={styles.itemCompany}>{company}</Text>
                <Text style={styles.itemDate}>{date}</Text>
            </View>
            <Text style={styles.itemDesc}>{desc}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
  },
  contentWrapper: {
      flex: 1,
      width: '100%',
      maxWidth: 800,
      paddingHorizontal: 20,
      paddingTop: 40,
  },
  webContentCentered: {
     alignItems: 'center'
  },
  
  // Header
  headerSection: {
      alignItems: 'center',
      marginBottom: 30,
      width: '100%'
  },
  headerText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: COLORS.textPrim,
      marginBottom: 10
  },
  webHeader: {
      fontSize: 48
  },
  purpleText: {
      color: COLORS.purple
  },
  subText: {
      color: COLORS.textSec,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20
  },
  downloadBtn: {
      backgroundColor: COLORS.purple,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 50,
      gap: 8,
      shadowColor: '#c770f0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5
  },
  btnText: {
      color: COLORS.textPrim,
      fontWeight: 'bold',
      fontSize: 16
  },

  // PDF Web Container
  pdfContainer: {
      flex: 1,
      width: '100%',
      backgroundColor: COLORS.cardBg,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 40,
      borderWidth: 1,
      borderColor: COLORS.border
  },

  // Digital Resume Mobile
  digitalResumeScroll: {
      flex: 1,
      width: '100%',
  },
  scrollContent: {
      paddingBottom: 50
  },
  section: {
      marginBottom: 30,
      backgroundColor: COLORS.cardBg,
      padding: 20,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.purple
  },
  sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.textPrim,
      marginBottom: 15,
      textTransform: 'uppercase',
      letterSpacing: 1
  },
  bodyText: {
      color: COLORS.textSec,
      lineHeight: 24,
      fontSize: 15
  },
  
  // Resume Items
  resumeItem: {
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  itemRole: {
      color: COLORS.textPrim,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4
  },
  itemMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      flexWrap: 'wrap'
  },
  itemCompany: {
      color: COLORS.purple,
      fontWeight: 'bold'
  },
  itemDate: {
      color: COLORS.textSec,
      fontSize: 12,
      fontStyle: 'italic'
  },
  itemDesc: {
      color: COLORS.textSec,
      fontSize: 14,
      lineHeight: 20
  },
  
  // Skills
  skillWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap'
  },
  skillBadges: {
      color: COLORS.textPrim,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 26
  }

});
