import { COLORS } from "@/constants/theme";
import { auth } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname, useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import * as Animatable from 'react-native-animatable';

import AddSubscriberModal from "@/components/modals/AddSubscriberModal";

export default function WebHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const [user, setUser] = useState<User | null>(null);
    const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);

    // Auth Subscription
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setUser);
        return unsub;
    }, []);

    // Only show on Web and Large Screens
    if (Platform.OS !== 'web' || width < 768) return null;

    const navItems = [
        { name: "Home", path: "/", icon: "home-outline" },
        { name: "About", path: "/about", icon: "person-outline" },
        { name: "Resume", path: "/resume", icon: "document-text-outline" },
        { name: "Projects", path: "/projects", icon: "code-slash-outline" },
        { name: "Blogs", path: "/blog", icon: "book-outline" },
        { name: "Contact", path: "/contact", icon: "mail-outline" },
    ];

    if (user) {
        navItems.splice(3, 0, { name: "Dashboard", path: "/dashboard", icon: "stats-chart-outline" });
    }

    // Secret Login Logic
    const [secretTaps, setSecretTaps] = useState(0);
    const handleLogoPress = () => {
        if (user) {
             router.push('/');
             return;
        }

        const newTaps = secretTaps + 1;
        setSecretTaps(newTaps);

        if (newTaps >= 5) {
            setSecretTaps(0);
            router.push('/login');
        } else {
             // If not yet 5 taps, treat as normal navigation to home after short delay if no more taps come
             // But for simplicity/UX, we can just navigate to home immediately 
             // AND count the tap. If they tap fast enough, they'll be redirected.
             // However, navigating to home might reset state if it causes a re-render/unmount.
             // Since WebHeader is in Layout (persistent), state might persist or we handle it carefully.
             // Better: Don't navigate on every tap if we want to detect secret. 
             // But user expects Logo -> Home.
             // Compromise: Navigate to home ONLY if secret taps are reset or low? 
             // Actually, best "Hidden" pattern: behave exactly like Home link, but track clicks.
             // We can use `router.push('/')` every time, but that might be annoying.
             // Let's just track clicks. If they pause, reset.
             if (pathname !== '/') {
                 router.push('/');
             }
        }

        // Reset taps if no activity for 2 seconds
        setTimeout(() => {
            setSecretTaps(0);
        }, 2000);
    };

    return (
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
            <View style={styles.container}>
                {/* Logo with Secret Login */}
                {/* Note: User requested to configure icon on project tab (?) and name on index for secret login 
                   Configuring Main Name for Secret Login
                */}
                <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.8}>
                    <Text style={styles.logo}>
                        Jabbar<Text style={styles.highlight}>.</Text>
                    </Text>
                </TouchableOpacity>

                {/* Nav Links */}
                <View style={styles.navLinks}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                        
                        return (
                            <Link key={item.name} href={item.path as any} asChild>
                                <TouchableOpacity style={StyleSheet.flatten([styles.navItem, isActive && styles.activeNavItem])}>
                                    <Ionicons 
                                        name={item.icon as any} 
                                        size={20} 
                                        color={isActive ? COLORS.textHighlight : COLORS.textSec} 
                                    />
                                    <Text style={StyleSheet.flatten([styles.navText, isActive && styles.activeNavText])}>
                                        {item.name}
                                    </Text>
                                    {isActive && <View style={styles.activeIndicator} />}
                                </TouchableOpacity>
                            </Link>
                        );
                    })}
                    

                </View>

                {/* Modals placed here or in root/layout. Since Header is in Layout, we can put modal here or use a context. 
                    Putting it here might be localized. Let's see if we can render it.
                    However, modals usually need to be at root. But React Native modals work fine.
                */}
                <AddSubscriberModal
                    visible={isAddUserModalVisible}
                    onClose={() => setIsAddUserModalVisible(false)}
                    onSuccess={() => {
                         // Simple success alert
                         alert("Subscriber Added Successfully!");
                    }}
                />
            </View>
        </Animatable.View>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(10, 10, 15, 0.7)', // Dark semi-transparent
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        ...Platform.select({
            web: {
                backdropFilter: 'blur(15px)',
                transition: 'all 0.3s ease'
            } as any
        })
    },
    container: {
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 40
    },
    logo: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.textPrim,
        letterSpacing: -1
    },
    highlight: {
        color: COLORS.textHighlight
    },
    navLinks: {
        flexDirection: 'row',
        gap: 30,
        alignItems: 'center'
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        position: 'relative'
    },
    activeNavItem: {
        // Optional active state style
    },
    navText: {
        fontSize: 16,
        color: COLORS.textSec,
        fontWeight: '500',
        transition: 'color 0.2s ease'
    } as any,
    activeNavText: {
        color: COLORS.textHighlight,
        fontWeight: '700'
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -24, // pushed to bottom of header
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: COLORS.textHighlight,
        borderRadius: 2,
        shadowColor: COLORS.textHighlight,
        shadowOpacity: 0.5,
        shadowRadius: 5
    }
});
