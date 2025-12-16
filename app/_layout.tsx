import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

function GlassTabBar() {
  if (Platform.OS === 'web') {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Semi-transparent based on primaryBg
        backdropFilter: 'blur(10px)', // Standard CSS blur
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      } as any} />
    );
  }

  // Native Blur
  return (
    <BlurView 
      intensity={50} 
      tint="dark" 
      style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(27, 26, 46, 0.5)' }]}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.tabBarActive,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        headerShown: false,
        tabBarBackground: () => <GlassTabBar />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: "Blogs",
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color }) => (
            <Ionicons name="code-slash-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resume"
        options={{
          title: "Resume",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Contact",
          tabBarIcon: ({ color }) => (
            <Ionicons name="mail-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="react-native-typewriter.d"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
