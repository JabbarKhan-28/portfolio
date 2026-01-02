
import { BlogPost } from '@/components/modals/AddBlogModal';
import AddSubscriberModal from '@/components/modals/AddSubscriberModal';
import { COLORS } from '@/constants/theme';
import { auth, db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface Subscriber {
    id: string;
    email: string;
    createdAt: Timestamp;
    source: string;
}

export default function DashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);

    // Data State
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [totalViews, setTotalViews] = useState(0);

    // Auth Guard
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                // Not logged in? Kick them out.
                router.replace('/'); 
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch Data
    useEffect(() => {
        if (!user) return;

        // 1. Fetch Subscribers
        const subQuery = query(collection(db, 'subscribers'), orderBy('createdAt', 'desc'));
        const unsubSubs = onSnapshot(subQuery, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscriber));
            setSubscribers(list);
        });

        // 2. Fetch Blogs for Stats
        const blogQuery = query(collection(db, 'blogs'), orderBy('views', 'desc'));
        const unsubBlogs = onSnapshot(blogQuery, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            setBlogs(list);
            
            // Calculate total views
            const total = list.reduce((acc, curr) => acc + (curr.views || 0), 0);
            setTotalViews(total);
        });

        return () => {
            unsubSubs();
            unsubBlogs();
        };
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.replace('/');
    };

    const openPdfBlog = async (blog: BlogPost) => {
        Haptics.selectionAsync();
        try {
            await WebBrowser.openBrowserAsync(blog.pdfPath);
        } catch (e) {
            console.error("Failed to open link", e);
            Linking.openURL(blog.pdfPath);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.textHighlight} />
            </View>
        );
    }

    if (!user) return null; // Should have redirected

    return (
        <View style={styles.container}>
             <View style={styles.glowTop} />
             <View style={styles.glowBottom} />

            <ScrollView 
                style={styles.container} 
                contentContainerStyle={[styles.content, { 
                    paddingTop: (Platform.OS === 'web' && width >= 768) ? 140 : insets.top + 5, 
                    paddingBottom: insets.bottom + 80 
                }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Dashboard</Text>
                        <Text style={styles.subtitle}>Welcome back, Admin</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={() => setIsAddUserModalVisible(true)} style={[styles.logoutBtn, { borderColor: `${COLORS.textHighlight}40`, backgroundColor: `${COLORS.textHighlight}10` }]}>
                             <Ionicons name="person-add-outline" size={24} color={COLORS.textHighlight} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard 
                        title='Total Views'
                        value={totalViews.toString()}
                        icon='eye-outline'
                        color={COLORS.purpleLight}
                    />
                    <StatCard 
                        title='Subscribers'
                        value={subscribers.length.toString()}
                        icon='people-outline'
                        color={COLORS.accent}
                    />
                    <StatCard 
                        title='Total Articles'
                        value={blogs.length.toString()}
                        icon='document-text-outline'
                        color={COLORS.textHighlight}
                    />
                </View>

                <View style={styles.sectionsContainer}>
                    {/* Newsletter Subscribers */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Subscribers</Text>
                        <View style={styles.listCard}>
                            {Platform.OS !== 'web' && (
                                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                            )}
                            {subscribers.length === 0 ? (
                                <Text style={styles.emptyText}>No subscribers yet.</Text>
                            ) : (
                                subscribers.slice(0, 3).map((sub, index) => (
                                    <View key={sub.id} style={[styles.listItem, index !== Math.min(subscribers.length, 3) - 1 && styles.borderBottom]}>
                                        <View style={styles.rankBadge}>
                                            <Ionicons name="mail" size={16} color={COLORS.textHighlight} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemTitle}>{sub.email}</Text>
                                            <Text style={styles.itemDate}>
                                                {sub.createdAt?.toDate().toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                    {/* Top Articles List */}
                    <View style={styles.section}>
                         <Text style={styles.sectionTitle}>Top Performing Articles</Text>
                         <View style={styles.listCard}>
                            {Platform.OS !== 'web' && (
                                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                            )}
                            {blogs.length === 0 ? (
                                <Text style={styles.emptyText}>No articles published.</Text>
                            ) : (
                                blogs.slice(0, 3).map((blog, index) => (
                                    <TouchableOpacity 
                                        key={blog.id} 
                                        style={[styles.listItem, index !== Math.min(blogs.length, 3) - 1 && styles.borderBottom]}
                                        onPress={() => openPdfBlog(blog)}
                                    >
                                        <View style={styles.rankBadge}>
                                            <Text style={styles.rankText}>#{index + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemTitle} numberOfLines={1}>{blog.title}</Text>
                                            <Text style={styles.itemDate}>
                                                {blog.createdAt?.toDate().toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View style={styles.viewBadge}>
                                            <Ionicons name="eye" size={14} color={COLORS.textSec} />
                                            <Text style={styles.viewCount}>{blog.views || 0}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                         </View>
                    </View>
                </View>

            </ScrollView>
            
            <AddSubscriberModal 
                visible={isAddUserModalVisible}
                onClose={() => setIsAddUserModalVisible(false)}
                onSuccess={() => {
                    // Optional: Show a success toast or Haptic feedback
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
            />
        </View>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
    return (
        <Animatable.View animation="fadeInUp" style={styles.statCard}>
            {Platform.OS !== 'web' && (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            )}
            <View style={[styles.iconBox, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </Animatable.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primaryBg,
        position: 'relative'
    },
    content: {
        paddingHorizontal: 20
    },
    glowTop: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.glowPurple,
        opacity: 0.4,
    },
    glowBottom: {
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.glowCyan,
        opacity: 0.2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.textPrim,
        letterSpacing: -1
    },
    subtitle: {
        color: COLORS.textSec,
        fontSize: 14,
        marginTop: 5
    },
    logoutBtn: {
        padding: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    
    // Stats
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        marginBottom: 30
    },
    statCard: {
        flex: 1,
        minWidth: 150,
        backgroundColor: 'rgba(30, 30, 40, 0.4)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        ...Platform.select({
            web: { 
                backdropFilter: 'blur(10px)',
                boxShadow: `0 0 20px ${COLORS.textHighlight}20` 
            } as any,
            default: {
                shadowColor: COLORS.textHighlight,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10
            }
        })
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrim
    },
    statTitle: {
        fontSize: 12,
        color: COLORS.textSec
    },

    // Sections
    sectionsContainer: {
        gap: 20,
        width: '100%'
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrim,
        marginBottom: 15,
        marginLeft: 5
    },
    listCard: {
        backgroundColor: 'rgba(30, 30, 40, 0.4)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        ...Platform.select({
            web: { 
                backdropFilter: 'blur(10px)',
                boxShadow: `0 0 30px ${COLORS.textHighlight}20` 
            } as any,
            default: {
                shadowColor: COLORS.textHighlight,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10
            }
        })
    },
    listItem: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)'
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rankText: {
        color: COLORS.textHighlight,
        fontWeight: 'bold',
        fontSize: 14
    },
    itemTitle: {
        fontSize: 16,
        color: COLORS.textPrim,
        fontWeight: '600',
        marginBottom: 4
    },
    itemDate: {
        fontSize: 12,
        color: COLORS.textSec
    },
    viewBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12
    },
    viewCount: {
        color: COLORS.textPrim,
        fontSize: 14,
        fontWeight: 'bold'
    },
    emptyText: {
        padding: 30,
        textAlign: 'center',
        color: COLORS.textSec
    }
});
