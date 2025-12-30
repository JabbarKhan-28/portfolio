import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";


import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ------------------ GOOGLE DRIVE LINKS ------------------ */
const GOOGLE_DRIVE_ID = "1Abh6vZLuBVRvN0OoOEIeVxAKhpy14ALD";
const RESUME_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_ID}`;
const RESUME_PREVIEW_URL = `https://drive.google.com/file/d/${GOOGLE_DRIVE_ID}/preview`;


export default function ResumeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [showPdf, setShowPdf] = React.useState(false);

  /* ------------------ MOBILE DOWNLOAD HANDLER ------------------ */
  const handleDownloadMobile = async () => {
    try {
      // Use WebBrowser for reliable download/viewing on Android
      await WebBrowser.openBrowserAsync(RESUME_DOWNLOAD_URL);
    } catch (error) {
       // Fallback
       Linking.openURL(RESUME_DOWNLOAD_URL);
    }
  };

  /* ------------------ VIEW PDF HANDLER ------------------ */
  const handleViewPdf = () => {
      if (isWeb) {
          setShowPdf(!showPdf);
      } else {
          // On Native, open in browser/drive app
          Linking.openURL(RESUME_PREVIEW_URL);
      }
  };

  /* ------------------ RENDER HEADER ------------------ */
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.headerText, isWeb && styles.webHeader]}>
        Professional <Text style={styles.purpleText}>Profile</Text>
      </Text>
      <View style={styles.headerDivider} />

      <Text style={styles.subText}>
        Deep dive into my technical journey, academic background, and core expertise.
      </Text>

      <View style={StyleSheet.flatten([
        styles.actionRow,
        width < 450 && { flexDirection: 'column', gap: 12 }
      ])}>


        {isWeb ? (
          <a
            href={RESUME_DOWNLOAD_URL}
            download="Jabbar_Khan_Resume.pdf"
            style={{ textDecoration: "none", width: (width < 450 ? '100%' : 'auto') as any }}

          >
            <View style={StyleSheet.flatten([styles.downloadBtn, width < 450 && { width: '100%', justifyContent: 'center' }])}>

              <Text style={styles.btnText}>Download CV</Text>
              <Ionicons
                name="cloud-download"
                size={22}
                color={COLORS.primaryBg}
              />
            </View>
          </a>
        ) : (
          <TouchableOpacity
            style={StyleSheet.flatten([styles.downloadBtn, width < 450 && { width: '100%', justifyContent: 'center' }])}
            onPress={handleDownloadMobile}
          >

            <Text style={styles.btnText}>Download CV</Text>
            <Ionicons
              name="cloud-download"
              size={22}
              color={COLORS.primaryBg}
            />
          </TouchableOpacity>
        )}

        {/* View PDF Button */}
        <TouchableOpacity 
            style={StyleSheet.flatten([styles.viewPdfBtn, width < 450 && { width: '100%', justifyContent: 'center' }])}
            onPress={handleViewPdf}
        >

            <Text style={styles.viewPdfBtnText}>
                {isWeb && showPdf ? "View Digital" : "View PDF"}
            </Text>
            <Ionicons
                name={isWeb && showPdf ? "document-text" : "eye"}
                size={22}
                color={COLORS.accent}
            />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Glows */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView 
        style={styles.digitalResumeScroll}
        contentContainerStyle={StyleSheet.flatten([
          styles.scrollContent, 
          { 
            alignItems: 'center',
            paddingTop: insets.top + (isWeb ? 60 : 20),
            paddingBottom: insets.bottom + 100
          }
        ])} 
        showsVerticalScrollIndicator={false}

      >
        <Animatable.View 
            animation="fadeIn" 
            duration={800} 
            style={StyleSheet.flatten([
                styles.contentWrapper, 
                isWeb && styles.webContentCentered, 
                { flex: 0, paddingHorizontal: width < 400 ? 15 : 20 }
            ])}
        >


            {showPdf ? (
                /* --- PDF VIEW --- */
                <>
                    {renderHeader()}
                    <View style={styles.pdfContainer}>
                        <iframe
                            src={RESUME_PREVIEW_URL}
                            title="Resume PDF"
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                            }}
                        />
                    </View>
                </>
            ) : (
                /* --- DIGITAL RESUME --- */
                <>
                    {renderHeader()}

                    {/* SUMMARY */}
                    <View style={StyleSheet.flatten([styles.section, { padding: width < 450 ? 24 : 35 }])}>

                      <Text style={styles.sectionTitle}>Summary</Text>
                      <Text style={styles.bodyText}>
                        Dynamic <Text style={styles.highlightText}>React Native Developer</Text> with a strong foundation in 
                        cross-platform architecture and user-centric design. Driven by the passion to build efficient, 
                        scalable, and high-performance applications from the ground up.
                      </Text>
                    </View>

                    {/* EXPERIENCE */}
                    <View style={StyleSheet.flatten([styles.section, { padding: width < 450 ? 24 : 35 }])}>

                      <Text style={styles.sectionTitle}>Experience</Text>

                      <ResumeItem
                        role="Freelance Full Stack Developer"
                        company="Self-Employed"
                        date="2024 – Present"
                        desc="Architecting mobile-first solutions using the MERN stack and Expo. Focused on optimizing bridge communication and UI responsiveness."
                      />

                      <ResumeItem
                        role="Software Development Enthusiast"
                        company="Open Source Communities"
                        date="2023 – 2024"
                        desc="Actively contributing to various GitHub repositories, improving application logic and UI consistency."
                      />
                    </View>

                    {/* EDUCATION */}
                    <View style={StyleSheet.flatten([styles.section, { padding: width < 450 ? 24 : 35 }])}>

                      <Text style={styles.sectionTitle}>Education</Text>
                      <ResumeItem
                        role="BS Computer Science"
                        company="Sir Syed CASE Institute of Technology"
                        date="2024 – 2028 (Expected)"
                        desc="Engaging in core CS fundamentals including DSA, Operating Systems, and Advanced Web Engineering."
                      />
                    </View>

                    {/* SKILLS */}
                    <View style={StyleSheet.flatten([styles.section, { borderBottomWidth: 0, paddingBottom: 30, padding: width < 450 ? 24 : 35 }])}>

                      <Text style={styles.sectionTitle}>Core Expertise</Text>

                      <View style={styles.skillRow}>
                        {["React Native", "TypeScript", "Node.js", "Firebase", "Git", "UI/UX"].map((skill, i) => (
                          <View key={i} style={styles.skillBadge}>
                            <Text style={styles.skillBadgeText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                </>
            )}
        </Animatable.View>
      </ScrollView>
    </View>
  );
}

/* ------------------ RESUME ITEM ------------------ */
function ResumeItem({
  role,
  company,
  date,
  desc,
}: {
  role: string;
  company: string;
  date: string;
  desc: string;
}) {
  return (
    <View style={styles.resumeItem}>
      <Text style={styles.itemRole}>{role}</Text>
      <View style={styles.itemMeta}>
        <Text style={styles.itemCompany}>{company}</Text>
        <Text style={styles.itemDate}>{date}</Text>
      </View>
      <Text style={styles.itemDesc}>{desc}</Text>
    </View>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
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
  contentWrapper: {
    paddingBottom: 40,
    width: '100%',
    maxWidth: 900
  },



  webContentCentered: {
    alignItems: "center",
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
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
  },
  headerDivider: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.textHighlight,
    borderRadius: 2,
    marginVertical: 20
  },
  purpleText: {
    color: COLORS.textHighlight,
  },
  subText: {
    color: COLORS.textSec,
    fontSize: 16,
    textAlign: "center",
    maxWidth: 550,
    lineHeight: 24,
    marginBottom: 30
  },


  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
    width: '100%',
    flexWrap: 'wrap'
  },
  downloadBtn: {
    backgroundColor: COLORS.textHighlight,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    gap: 12,
    elevation: 10,
    shadowColor: COLORS.textHighlight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15
  },


  btnText: {
    color: COLORS.darkBg,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },



  viewPdfBtn: {
    backgroundColor: 'rgba(45, 212, 191, 0.05)', 
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    gap: 12,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      } as any,
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        borderWidth: 2, 
      }
    })
  },
  viewPdfBtnText: {
    color: COLORS.accent,
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },




  pdfContainer: {
    width: "100%",
    backgroundColor: COLORS.darkBg,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 1000, // Fixed height for proper scrolling
    marginTop: 20
  },

  digitalResumeScroll: {
    width: "100%",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },

  section: {
   borderRadius: 32, 
      overflow: "hidden", 
      borderWidth: 1.5, 
    borderColor: COLORS.border,
      marginBottom:10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textHighlight,
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 2
  },

  bodyText: {
    color: COLORS.textSec,
    fontSize: 18,
    lineHeight: 28,
  },


  highlightText: {
    color: COLORS.textPrim,
    fontWeight: '800'
  },

  resumeItem: {
    marginBottom: 30,
    width: '100%'
  },
  itemRole: {
    color: COLORS.textPrim,
    fontSize: Platform.OS === 'android' ? 22 : 22,
    fontWeight: "800",
    marginBottom: 5
  },



  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 10
  },
  itemCompany: {
    color: COLORS.textHighlight,
    fontWeight: "700",
    fontSize: 16
  },
  itemDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  itemDesc: {
    color: COLORS.textSec,
    fontSize: 15,
    lineHeight: 24,
  },



  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  skillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  skillBadgeText: {
    color: COLORS.textPrim,
    fontSize: 15,
    fontWeight: '700'
  },
});
