import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { LogBox, Platform, StyleSheet, View } from "react-native";

LogBox.ignoreLogs([
  "props.pointerEvents is deprecated",
  "Shadow props have been deprecated",
]);

function GlassTabBar() {
  if (Platform.OS === 'web') {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(3, 4, 94, 0.6)', // Semi-transparent Ocean Blue
        backdropFilter: 'blur(20px)', // Stronger CSS blur
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: 1,
        borderColor: 'rgba(144, 224, 239, 0.3)' // Subtle bright border
      } as any} />
    );
  }

  // Native Blur
  return (
    <BlurView 
      intensity={80} 
      tint="dark" 
      style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(3, 4, 94, 0.5)' }]}
    />
  );
}

export default function TabLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root {
          background-color: ${COLORS.primaryBg} !important; 
          min-height: 100% !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        // Optional cleanup if we wanted to be strict, but for global theme it's fine to keep
        // document.head.removeChild(style);
      };
    }
  }, []);

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
        name="login"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="pdf/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
