import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Project {
  title: string;
  description: string;
  ghLink: string;
  demoLink: string;
  image?: any;
}

// Placeholder data since we don't have the image assets loaded yet
export const PROJECTS: Project[] = [
  {
    title: "Quiz App (React Native)",
    description: "A mobile quiz application built using React Native. Features include user authentication, complex scoring logic, and dynamic API-based questions to deliver a versatile and engaging user experience.",
    ghLink: "https://github.com/JabbarKhan-28", // Placeholder link
    demoLink: "",
    image: require("../assets/Projects/icon.png"), // Placeholder until quiz-app.png is added
  }
];

export default function ProjectsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
       <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            My Recent <Text style={styles.purpleText}>Works</Text>
          </Text>
          <Text style={styles.subText}>Here are a few projects I've worked on recently.</Text>
       </View>

       <View style={styles.projectsContainer}>
          {PROJECTS.map((project, index) => (
             <ProjectCard key={index} project={project} />
          ))}
       </View>
    </ScrollView>
  );
}

function ProjectCard({ project }: { project: Project }) {
    const handleLink = (url: string) => {
        if (url) Linking.openURL(url);
    }

    return (
        <View style={styles.card}>
            {/* Image Placeholder */}
            <View style={styles.imageContainer}>
                 <Image 
                    source={require('../assets/Projects/icon.png')} 
                    style={styles.projectImage} 
                    contentFit="contain"
                 />
            </View>
            
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{project.title}</Text>
                <Text style={styles.cardDescription}>{project.description}</Text>
                
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => handleLink(project.ghLink)}>
                        <Ionicons name="logo-github" size={20} color={COLORS.textPrim} />
                        <Text style={styles.buttonText}>GitHub</Text>
                    </TouchableOpacity>
                    
                    {project.demoLink ? (
                         <TouchableOpacity style={styles.button} onPress={() => handleLink(project.demoLink)}>
                            <Ionicons name="desktop-outline" size={20} color={COLORS.textPrim} />
                            <Text style={styles.buttonText}>Demo</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100
  },
  headerContainer: {
      alignItems: 'center',
      marginBottom: 30
  },
  headerText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.textPrim,
      marginBottom: 10
  },
  purpleText: {
      color: COLORS.purple
  },
  subText: {
      color: COLORS.textPrim,
      fontSize: 16
  },
  projectsContainer: {
      gap: 20
  },
  card: {
      backgroundColor: COLORS.cardBg,
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(199, 112, 240, 0.2)'
  },
  imageContainer: {
      height: 200,
      width: '100%',
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center'
  },
  projectImage: {
      width: '100%',
      height: '100%'
  },
  cardBody: {
      padding: 20
  },
  cardTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: COLORS.textPrim,
      marginBottom: 10,
      textAlign: 'center'
  },
  cardDescription: {
      color: COLORS.textPrim,
      textAlign: 'justify',
      marginBottom: 20,
      lineHeight: 20
  },
  buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10
  },
  button: {
      backgroundColor: COLORS.darkPurple,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      gap: 8
  },
  buttonText: {
      color: COLORS.textPrim,
      fontWeight: 'bold'
  }
});
