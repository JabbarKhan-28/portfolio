import BackgroundGlows from '@/components/ui/BackgroundGlows';
import ResumeItem from '@/components/ui/ResumeItem';
import { COLORS } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import { pickAndUploadToCloudinary } from "@/services/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import React from "react";
import {
    ActivityIndicator,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ------------------ RESUME LINKS ------------------ */
// Replace this with your actual Cloudinary PDF URL
// For downloading (Cloudinary forces download with fl_attachment usually, or just use the direct link)
const DEFAULT_RESUME_URL = "https://res.cloudinary.com/duskoy255/image/upload/v1767098976/j85ez7ptvtoilacagggh.pdf"; 


export default function ResumeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isDesktopWeb = Platform.OS === "web" && width >= 768;
  const isMobileWeb = Platform.OS === "web" && width < 768;
  const isAndroidOrMobileWeb = Platform.OS === 'android' || isMobileWeb;
  
  const [user, setUser] = React.useState<User | null>(null);
  const [resumeUrl, setResumeUrl] = React.useState(DEFAULT_RESUME_URL);
  const [isUploading, setIsUploading] = React.useState(false);

  // Derived URLs
  const downloadUrl = resumeUrl.replace("/upload/", "/upload/fl_attachment/");
  const previewUrl = resumeUrl;
  
  // Auth Listener
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  // Fetch Resume URL from DB
  React.useEffect(() => {
      const unsub = onSnapshot(doc(db, 'config', 'portfolio'), (snap) => {
          if (snap.exists() && snap.data().resumeUrl) {
              setResumeUrl(snap.data().resumeUrl);
          }
      });
      return unsub;
  }, []);

  // Admin Update Resume
  const handleUpdateResume = async () => {
      try {
          setIsUploading(true);
          const result = await pickAndUploadToCloudinary();
          if (result && result.url) {
              // Save to Firestore
              await setDoc(doc(db, 'config', 'portfolio'), {
                  resumeUrl: result.url
              }, { merge: true });
              alert("Resume Updated Successfully!");
          }
      } catch (error: any) {
          alert("Failed to upload: " + error.message);
      } finally {
          setIsUploading(false);
      }
  };
  
  /* ------------------ MOBILE DOWNLOAD HANDLER ------------------ */
  const handleDownloadMobile = async () => {
    try {
      await WebBrowser.openBrowserAsync(downloadUrl);
    } catch (error) {
       Linking.openURL(downloadUrl);
    }
  };

  /* ------------------ VIEW PDF HANDLER ------------------ */
  const handleViewPdf = async () => {
      // Open Cloudinary URL directly in browser (In-App Browser or System Browser)
      try {
          await WebBrowser.openBrowserAsync(previewUrl);
      } catch (error) {
          Linking.openURL(previewUrl);
      }
  };

  /* ------------------ RENDER HEADER ------------------ */
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.headerText, isDesktopWeb && styles.webHeader]}>
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


        {isDesktopWeb ? (
          <a
            href={downloadUrl}
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
            style={[
                styles.viewPdfBtn, 
                width < 450 && { width: '100%', justifyContent: 'center' },
                isMobileWeb && {
                    borderWidth: 2,
                    backdropFilter: 'none',
                    backgroundColor: 'rgba(45, 212, 191, 0.05)',
                } as any
            ]}
            onPress={handleViewPdf}
        >

            <Text style={styles.viewPdfBtnText}>
                View Resume
            </Text>
            <Ionicons
                name="eye"
                size={22}
                color={COLORS.accent}
            />
        </TouchableOpacity>

        {/* ADMIN UPDATE BUTTON */}
        {user && (
            <TouchableOpacity 
                style={[styles.viewPdfBtn, { borderColor: COLORS.purple, backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}
                onPress={handleUpdateResume}
                disabled={isUploading}
            >
                {isUploading ? <ActivityIndicator size="small" color={COLORS.purple} /> : (
                    <>
                        <Text style={[styles.viewPdfBtnText, { color: COLORS.purple }]}>
                            Update
                        </Text>
                        <Ionicons
                            name="cloud-upload"
                            size={22}
                            color={COLORS.purple}
                        />
                    </>
                )}
            </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Glows */}
      <BackgroundGlows top bottom />

      <ScrollView 
        style={styles.digitalResumeScroll}
        contentContainerStyle={StyleSheet.flatten([
          styles.scrollContent, 
          { 
            alignItems: 'center',
            paddingTop: insets.top + (isDesktopWeb ? 140 : 5),
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
                isDesktopWeb && styles.webContentCentered, 
                { flex: 0, paddingHorizontal: width < 400 ? 15 : 20 }
            ])}
        >
                {/* --- DIGITAL RESUME --- */}
                {renderHeader()}

                {/* SUMMARY */}
                    <View style={[
                        styles.section, 
                        { padding: width < 450 ? 24 : 35 },
                        isMobileWeb && {
                             boxShadow: 'none',
                             backdropFilter: 'none',
                             transition: 'none',
                             shadowColor: COLORS.textHighlight,
                             shadowOffset: { width: 0, height: 10 },
                             shadowOpacity: 0.2,
                             shadowRadius: 20,
                        } as any
                    ]}>
                      {Platform.OS !== 'web' && (
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                      )}
                      <Text style={styles.sectionTitle}>Summary</Text>
                      <Text style={styles.bodyText}>
                        Dynamic <Text style={styles.highlightText}>React Native Developer</Text> with a strong foundation in 
                        cross-platform architecture and user-centric design. Driven by the passion to build efficient, 
                        scalable, and high-performance applications from the ground up.
                      </Text>
                    </View>

                    {/* EXPERIENCE */}
                    <View style={[
                        styles.section, 
                        { padding: width < 450 ? 24 : 35 },
                         isMobileWeb && {
                             boxShadow: 'none',
                             backdropFilter: 'none',
                             transition: 'none',
                             shadowColor: COLORS.textHighlight,
                             shadowOffset: { width: 0, height: 10 },
                             shadowOpacity: 0.2,
                             shadowRadius: 20,
                        } as any
                    ]}>
                      {Platform.OS !== 'web' && (
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                      )}
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
                    <View style={[
                        styles.section,
                        { padding: width < 450 ? 24 : 35 },
                        isMobileWeb && {
                             boxShadow: 'none',
                             backdropFilter: 'none',
                             transition: 'none',
                             shadowColor: COLORS.textHighlight,
                             shadowOffset: { width: 0, height: 10 },
                             shadowOpacity: 0.2,
                             shadowRadius: 20,
                        } as any
                    ]}>
                      {Platform.OS !== 'web' && (
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                      )}
                      <Text style={styles.sectionTitle}>Education</Text>
                      <ResumeItem
                        role="BS Computer Science"
                        company="Sir Syed CASE Institute of Technology"
                        date="2024 – 2028 (Expected)"
                        desc="Engaging in core CS fundamentals including DSA, Operating Systems, and Advanced Web Engineering."
                      />
                    </View>

                    {/* SKILLS */}
                    <View style={[
                         styles.section, 
                         { borderBottomWidth: 0, paddingBottom: 30, padding: width < 450 ? 24 : 35 },
                         isMobileWeb && {
                             boxShadow: 'none',
                             backdropFilter: 'none',
                             transition: 'none',
                             shadowColor: COLORS.textHighlight,
                             shadowOffset: { width: 0, height: 10 },
                             shadowOpacity: 0.2,
                             shadowRadius: 20,
                        } as any
                    ]}>
                      {Platform.OS !== 'web' && (
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                      )}
                      <Text style={styles.sectionTitle}>Core Expertise</Text>

                      <View style={styles.skillRow}>
                        {["React Native","React", "TypeScript", "Javascript", "Firebase", "Git", "Github"].map((skill, i) => (
                          <View key={i} style={styles.skillBadge}>
                            <Text style={styles.skillBadgeText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
}

// ResumeItem extracted to components/ResumeItem.tsx

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },

  // Glow styles removed - used BackgroundGlows component
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
      borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 30, 40, 0.4)',
      marginBottom:10,
      ...Platform.select({
          web: {
              boxShadow: `0 0 40px ${COLORS.textHighlight}40`,
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
    color: COLORS.textPrim,
    fontSize: Platform.OS === 'android' ? 14 : 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:10,
    opacity: 0.8
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

  // ResumeItem styles removed - moved to component
  
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
