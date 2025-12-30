import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Analytics } from "@vercel/analytics/react";
import { BlurView } from 'expo-blur';
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { LogBox, Platform, StyleSheet, View, useWindowDimensions } from "react-native";


LogBox.ignoreLogs([
  "props.pointerEvents is deprecated",
  "Shadow props have been deprecated",
]);

// Polyfill/Hack to silence the terminal warnings during web build (SSR)
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args[0];
    if (typeof msg === 'string' && (
      msg.includes("props.pointerEvents is deprecated") || 
      msg.includes("Shadow props have been deprecated")
    )) {
      return;
    }
    originalWarn(...args);
  };
}

function GlassTabBar() {
  if (Platform.OS === 'web') {
    return (
      <View style={{
        flex: 1,
        backgroundColor: `${COLORS.primaryBg}CC`, // Semi-transparent using theme color
        backdropFilter: 'blur(25px)', 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: 1,
        borderColor: COLORS.border
      } as any} />
    );
  }

  // Native Blur
  return (
    <BlurView 
      intensity={80} 
      tint="dark" 
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: `${COLORS.primaryBg}F2`, // Slightly more opaque for better legibility on Android
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)'
      }}
    />

  );
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
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
    <>
    <StatusBar style="light" />


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
          height: (Platform.OS === 'android' || width < 768) ? 80 : 60, 
          paddingBottom: (Platform.OS === 'android' || width < 768) ? 20 : 5,
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
    {Platform.OS === 'web' && <Analytics />}
    </>
  );
}
