import CustomDrawerContent from '@/components/layout/CustomDrawerContent';
import WebHeader from '@/components/layout/WebHeader';
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Analytics } from "@vercel/analytics/react";
import * as NavigationBar from 'expo-navigation-bar';
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from "react";
import { LogBox, Platform, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

LogBox.ignoreLogs([
  "props.pointerEvents is deprecated",
  "Shadow props have been deprecated",
]);

// Polyfill for Web Warnings
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args[0];
    if (typeof msg === 'string' && (
      msg.includes("props.pointerEvents is deprecated") || 
      msg.includes("Shadow props have been deprecated") ||
      msg.includes('"shadow*" style props are deprecated')
    )) {
      return;
    }
    originalWarn(...args);
  };
}

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width >= 768;

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
         // Cleanup usually not needed
      };
    }

    // Android System Navigation Bar
    if (Platform.OS === 'android') {
        NavigationBar.setBackgroundColorAsync(COLORS.primaryBg);
        NavigationBar.setButtonStyleAsync("light"); // Light icons for dark background
        SystemUI.setBackgroundColorAsync(COLORS.primaryBg);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.primaryBg }}>
      <StatusBar style="light" />
      
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: !isWebDesktop, // Hide header on Web Desktop
          headerStyle: {
              backgroundColor: COLORS.primaryBg,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border // 'rgba(255, 255, 255, 0.1)'
          },
          headerTintColor: COLORS.textPrim,
          headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20
          },
          drawerStyle: {
            backgroundColor: COLORS.primaryBg,
            width: 280,
            borderRightWidth: 1,
            borderRightColor: COLORS.border,
          },
          drawerActiveTintColor: COLORS.textHighlight,
          drawerActiveBackgroundColor: 'rgba(45, 212, 191, 0.1)',
          drawerInactiveTintColor: COLORS.textSec,
          drawerType: isWebDesktop ? 'front' : 'slide', // Don't take space on web
          drawerHideStatusBarOnOpen: false,
          overlayColor: 'rgba(0,0,0,0.7)',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="about"
          options={{
            title: "About",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="resume"
          options={{
            title: "Resume",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="projects"
          options={{
            title: "Projects",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="code-slash-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="blog"
          options={{
            title: "Blogs",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="contact"
          options={{
            title: "Contact",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="mail-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Hidden Routes */}
        <Drawer.Screen
          name="login"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false // Also hide header for login even on mobile usually? Or keep standard.
          }}
        />
        <Drawer.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            headerShown: !isWebDesktop // Show header on mobile dashboard
          }}
        />
        <Drawer.Screen
          name="resume-viewer"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false
          }}
        />
         <Drawer.Screen
          name="pdf/[id]"
          options={{
            drawerItemStyle: { display: 'none' },
             headerShown: false
          }}
        />
      </Drawer>
      
      {/* Web Header Overlay */}
      <WebHeader />
      
      {Platform.OS === 'web' && <Analytics />}
    </GestureHandlerRootView>
  );
}
