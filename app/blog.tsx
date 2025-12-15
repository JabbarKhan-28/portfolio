
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BlogPost {
  title: string;
  date: string;
  summary: string;
  mediumLink?: string;
}

const BLOGS: BlogPost[] = [
  {
    title: "Understanding React Native Reanimated",
    date: "Dec 10, 2024",
    summary: "A deep dive into animations in React Native using the Reanimated 2 library.",
    mediumLink: "https://medium.com/@jabbar_khan" // Placeholder
  },
  {
    title: "Optimizing List Performance",
    date: "Nov 28, 2024",
    summary: "How to make your FlatLists buttery smooth with large datasets.",
    mediumLink: "https://medium.com/@jabbar_khan"
  },
  {
    title: "The Power of TypeScript",
    date: "Nov 15, 2024",
    summary: "Why you should be using TypeScript in every React Native project.",
    mediumLink: "https://medium.com/@jabbar_khan"
  }
];

export default function BlogScreen() {
  const handleReadMore = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
       <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            My <Text style={styles.purpleText}>Blogs</Text>
          </Text>
          <Text style={styles.subText}>Thoughts, tutorials, and tech ramblings.</Text>
       </View>

       <View style={styles.listContainer}>
          {BLOGS.map((blog, index) => (
             <View key={index} style={styles.blogCard}>
                <View style={styles.blogHeader}>
                    <Text style={styles.blogTitle}>{blog.title}</Text>
                    <Text style={styles.blogDate}>{blog.date}</Text>
                </View>
                <Text style={styles.blogSummary}>{blog.summary}</Text>
                
                <TouchableOpacity 
                    style={styles.readMoreBtn}
                    onPress={() => handleReadMore(blog.mediumLink)}
                >
                    <Text style={styles.readMoreText}>Read Article</Text>
                    <Ionicons name="open-outline" size={16} color={COLORS.purple} />
                </TouchableOpacity>
             </View>
          ))}
       </View>
    </ScrollView>
  );
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
      color: COLORS.textSec,
      fontSize: 16
  },
  listContainer: {
      gap: 20
  },
  blogCard: {
      backgroundColor: COLORS.cardBg,
      padding: 20,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.purple
  },
  blogHeader: {
      marginBottom: 10
  },
  blogTitle: {
      color: COLORS.textPrim,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5
  },
  blogDate: {
      color: COLORS.textSec,
      fontSize: 12,
      fontStyle: 'italic'
  },
  blogSummary: {
      color: COLORS.textSec,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 15
  },
  readMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5
  },
  readMoreText: {
      color: COLORS.purple,
      fontWeight: 'bold'
  }
});
