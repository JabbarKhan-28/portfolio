import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

/* ------------------ GOOGLE DRIVE LINKS ------------------ */
const GOOGLE_DRIVE_ID = "1Abh6vZLuBVRvN0OoOEIeVxAKhpy14ALD";
const RESUME_DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_ID}`;
const RESUME_PREVIEW_URL = `https://drive.google.com/file/d/${GOOGLE_DRIVE_ID}/preview`;


export default function ResumeScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const [showPdf, setShowPdf] = React.useState(false);

  /* ------------------ MOBILE DOWNLOAD HANDLER ------------------ */
  const handleDownloadMobile = async () => {
    try {
      // Cast to any because documentDirectory might be missing in some type definitions
      const fileSystem = FileSystem as any;
      const fileUri =
        (fileSystem.documentDirectory || fileSystem.cacheDirectory) + "Jabbar_Khan_Resume.pdf";

      const download = FileSystem.createDownloadResumable(
        RESUME_DOWNLOAD_URL,
        fileUri
      );

      await download.downloadAsync();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Downloaded", "Resume saved to your device.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download resume");
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
        My <Text style={styles.purpleText}>Resume</Text>
      </Text>

      <Text style={styles.subText}>
        Check out my resume below or download it for later.
      </Text>

      <View style={styles.actionRow}>
        {isWeb ? (
          <a
            href={RESUME_DOWNLOAD_URL}
            download="Jabbar_Khan_Resume.pdf"
            style={{ textDecoration: "none" }}
          >
            <View style={styles.downloadBtn}>
              <Text style={styles.btnText}>Download CV</Text>
              <Ionicons
                name="cloud-download-outline"
                size={20}
                color={COLORS.primaryBg}
              />
            </View>
          </a>
        ) : (
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={handleDownloadMobile}
          >
            <Text style={styles.btnText}>Download CV</Text>
            <Ionicons
              name="cloud-download-outline"
              size={20}
              color={COLORS.primaryBg}
            />
          </TouchableOpacity>
        )}

        {/* View PDF Button (Supported on all platforms now) */}
        <TouchableOpacity 
            style={[styles.downloadBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.purple }]}
            onPress={handleViewPdf}
        >
            <Text style={[styles.btnText, { color: COLORS.purple }]}>
                {isWeb && showPdf ? "View Text" : "View PDF"}
            </Text>
            <Ionicons
                name={isWeb && showPdf ? "document-text-outline" : "eye-outline"}
                size={20}
                color={COLORS.purple}
            />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {showPdf ? (
        /* ------------------ PDF VIEW (Header Fixed, Web Only) ------------------ */
        <View style={[styles.contentWrapper, isWeb && styles.webContentCentered]}>
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
        </View>
      ) : (
        /* ------------------ DIGITAL RESUME (Whole Page Scroll) ------------------ */
        <ScrollView
            style={styles.digitalResumeScroll}
            contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]} 
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.contentWrapper, isWeb && styles.webContentCentered, { flex: 0 }]}>
                {renderHeader()}

                {/* SUMMARY */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Summary</Text>
                  <Text style={styles.bodyText}>
                    Passionate React Native Developer with strong experience in
                    building cross-platform mobile applications using modern
                    technologies. Currently pursuing BS Computer Science.
                  </Text>
                </View>

                {/* EXPERIENCE */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Experience</Text>

                  <ResumeItem
                    role="Freelance Full Stack Developer"
                    company="Self-Employed"
                    date="2024 – Present"
                    desc="Developing mobile and web applications using React Native, backend integrations, and modern UI practices."
                  />

                  <ResumeItem
                    role="Open Source Contributor"
                    company="GitHub"
                    date="2023 – 2024"
                    desc="Contributed to React Native projects, bug fixes, and documentation improvements."
                  />
                </View>

                {/* EDUCATION */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Education</Text>
                  <ResumeItem
                    role="BS Computer Science"
                    company="Sir Syed CASE Institute of Technology"
                    date="2024 – 2028 (Expected)"
                    desc="Relevant Coursework: Data Structures, Algorithms, OOP, Databases."
                  />
                </View>

                {/* SKILLS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Technical Skills</Text>
                  <Text style={styles.skillBadges}>
                    React Native • TypeScript • JavaScript • Node.js • Firebase • Git
                    • UI/UX
                  </Text>
                </View>
            </View>
        </ScrollView>
      )}
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
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  webContentCentered: {
    alignItems: "center",
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
  },
  actionRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 15
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textPrim,
  },
  webHeader: {
    fontSize: 48,
  },
  purpleText: {
    color: COLORS.purple,
  },
  subText: {
    color: COLORS.textSec,
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
  },

  downloadBtn: {
    backgroundColor: COLORS.textHighlight,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    gap: 10,
    elevation: 5,
  },
  btnText: {
    color: COLORS.primaryBg,
    fontWeight: "bold",
    fontSize: 16,
  },

  pdfContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 850,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  digitalResumeScroll: {
    width: "100%",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  section: {
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 25,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.purple,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
        web: { backdropFilter: 'blur(4px)' },
        default: {}
    })
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrim,
    marginBottom: 15,
    textTransform: "uppercase",
  },
  bodyText: {
    color: COLORS.textSec,
    lineHeight: 24,
  },

  resumeItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  itemRole: {
    color: COLORS.textPrim,
    fontSize: 18,
    fontWeight: "600",
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemCompany: {
    color: COLORS.purple,
    fontWeight: "bold",
  },
  itemDate: {
    color: COLORS.textSec,
    fontSize: 12,
    fontStyle: "italic",
  },
  itemDesc: {
    color: COLORS.textSec,
    marginTop: 6,
  },

  skillBadges: {
    color: COLORS.textPrim,
    fontSize: 16,
    lineHeight: 26,
  },
});
