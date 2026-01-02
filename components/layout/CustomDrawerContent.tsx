import { COLORS } from "@/constants/theme";
import { auth } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryBg }}>
      {/* HEADER SECTION */}
      <View style={StyleSheet.flatten([styles.header, { paddingTop: insets.top + 20 }])}>
        <View style={styles.profileContainer}>
            <View style={styles.avatarBorder}>
                <Image 
                    source={user?.photoURL ? { uri: user.photoURL } : require('@/assets/guest.jpg')} 
                    style={styles.avatar} 
                />
            </View>
            <View>
                <Text style={styles.userName}>
                    {user ? "Jabbar Khan" : "Welcome, Guest"}
                </Text>
                <Text style={styles.userRole}>
                    {user ? "Administrator" : "Explore Portfolio"}
                </Text>
            </View>
        </View>
      </View>

      {/* DRAWER ITEMS */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        <DrawerItemList 
            {...props} 
            state={{
                ...props.state,
                routes: props.state.routes.filter((route: any) => 
                    user ? true : route.name !== 'dashboard'
                ),
                routeNames: user 
                    ? props.state.routeNames 
                    : props.state.routeNames.filter((name: string) => name !== 'dashboard')
            }}
        />
      </DrawerContentScrollView>

      {/* FOOTER SECTION */}
      <View style={StyleSheet.flatten([styles.footer, { paddingBottom: insets.bottom + 20 }])}>
        {user ? (
             <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>Sign Out</Text>
             </TouchableOpacity>
        ) : (
             <TouchableOpacity style={styles.loginHint} onPress={() => router.push('/login')}>
                <Ionicons name="finger-print" size={20} color={COLORS.textSec} />
                <Text style={styles.versionText}>Admin Access</Text>
             </TouchableOpacity>
        )}
        <Text style={styles.copyrightText}>© {new Date().getFullYear()} Jabbar Khan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    avatarBorder: {
        width: 60, 
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: COLORS.textHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.textHighlight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.darkBg
    },
    userName: {
        color: COLORS.textPrim,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    userRole: {
        color: COLORS.textHighlight,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)'
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 12
    },
    logoutText: {
        color: COLORS.error,
        fontWeight: 'bold',
        fontSize: 15
    },
    loginHint: {
         flexDirection: 'row',
         alignItems: 'center',
         gap: 10,
         opacity: 0.5
    },
    versionText: {
        color: COLORS.textSec,
        fontSize: 12
    },
    copyrightText: {
        color: COLORS.textSec,
        fontSize: 10,
        textAlign: 'center',
        marginTop: 15,
        opacity: 0.5
    }
});
