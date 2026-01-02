
import CustomAlertModal, { AlertType } from '@/components/modals/CustomAlertModal';
import { EMAIL_REGEX } from '@/constants/regex';
import { COLORS } from '@/constants/theme';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';

export default function NewsletterSection({ compact = false }: { compact?: boolean }) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768; // Mobile or Mobile Web
    const isDesktop = Platform.OS === 'web' && width > 768;
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        type: AlertType;
        title: string;
        message: string;
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
    });

    const handleSubscribe = async () => {
        if (!email.trim()) return;

        if (!EMAIL_REGEX.test(email)) {
            setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Invalid Email',
                message: 'Please enter a valid email address.',
            });
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'subscribers'), {
                email: email.trim(),
                createdAt: serverTimestamp(),
                source: 'portfolio-web'
            });

            setAlertConfig({
                visible: true,
                type: 'success',
                title: 'Welcome!',
                message: 'You have been subscribed to the newsletter.',
            });
            setEmail('');
        } catch (error: any) {
            console.error("Subscription error:", error);
            setAlertConfig({
                visible: true,
                type: 'error',
                title: 'Error',
                message: 'Something went wrong. Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            <View style={[
                styles.card,
                isDesktop && !compact && styles.webCard,
                compact && styles.compactCard
            ]}>
                {Platform.OS !== 'web' && (
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                )}
                <View style={[
                    styles.content, 
                    compact && { flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: 20 },
                    (isDesktop && !compact) && { flexDirection: 'column', alignItems: 'center', width: '100%', gap: 30 }
                ]}>
                    {!compact && (
                        <View style={[styles.iconContainer, (isDesktop && !compact) && { marginBottom: 0 }]}>
                            <Ionicons name="newspaper-outline" size={32} color={COLORS.textHighlight} />
                        </View>
                    )}
                    
                    <View style={[
                        styles.textContainer, 
                        compact && { marginBottom: isMobile ? 15 : 0, flex: 1, minWidth: 200, width: isMobile ? '100%' : 'auto' },
                        (isDesktop && !compact) && { alignItems: 'center', marginBottom: 0, width: '100%' }
                    ]}>
                        <Text style={[
                            styles.title, 
                            compact && styles.compactTitle,
                            (isDesktop && !compact) && { textAlign: 'center' }
                        ]}>
                            {compact ? "Subscribe to updates" : "Stay in the loop"}
                        </Text>
                        {!compact && (
                            <Text style={[
                                styles.subtitle,
                                (isDesktop && !compact) && { textAlign: 'center' }
                            ]}>
                                Join other developers receiving the latest updates on my projects and articles.
                            </Text>
                        )}
                    </View>

                    <View style={[
                        styles.form,
                        (isDesktop && !compact) && { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 500, justifyContent: 'center' },
                        compact && { flexDirection: isMobile ? 'column' : 'row', gap: 15, flex: 1, minWidth: 250, width: isMobile ? '100%' : 'auto' }
                    ]}>
                        <TextInput
                            style={[
                                styles.input,
                                (isDesktop && !compact) && { marginBottom: 0, marginRight: 15, flex: 1 },
                                compact && styles.compactInput,
                                (compact && isMobile) && { marginBottom: 0, width: '100%' }
                            ]}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.textSec}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TouchableOpacity
                            style={[
                                styles.button,
                                (isDesktop && !compact) && { width: 'auto', minWidth: 140 },
                                compact && styles.compactButton,
                                (compact && isMobile) && { width: '100%', alignItems: 'center' }
                            ]}
                            onPress={handleSubscribe}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.primaryBg} size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Subscribe</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <CustomAlertModal
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        width: '100%',
        alignItems: 'center',
        marginBottom: 40
    },
    card: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: 'rgba(30, 30, 40, 0.4)', // Glassy dark
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        ...Platform.select({
            web: {
                backdropFilter: 'blur(40px)',
                boxShadow: `0 0 40px ${COLORS.textHighlight}40`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            } as any,
            default: {
                shadowColor: COLORS.textHighlight,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 20
            }
        })
    },
    webCard: {
        padding: 30, // Reduced from 50 to prevent overflow on smaller desktop windows
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start' 
    },
    content: {
        width: '100%'
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(45, 212, 191, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(45, 212, 191, 0.3)',
        alignSelf: 'center', // Default to center
         ...Platform.select({
            web: {
                boxShadow: '0 0 20px rgba(45, 212, 191, 0.2)',
                marginBottom: 0 // Reset margin for web row layout
            } as any
        })
    },
    textContainer: {
        marginBottom: 5,
        alignItems: 'center',
        width: '100%'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrim,
        marginBottom: 5,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSec,
        lineHeight: 24,
        textAlign: 'center',
        maxWidth: 500
    },
    form: {
        width: '100%'
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 16,
        padding: 16,
        color: COLORS.textPrim,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 15
    },
    button: {
        backgroundColor: COLORS.textHighlight,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 140,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 15px rgba(45, 212, 191, 0.4)',
                transition: 'all 0.3s ease',
            } as any,
            default: {
                elevation: 4,
                shadowColor: COLORS.textHighlight,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8
            }
        })
    },
    buttonText: {
        color: COLORS.primaryBg,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    // Compact Styles
    compactContainer: {
        marginBottom: 25,
        padding: 0
    },
    compactCard: {
        borderRadius: 24,
        padding: 24,
        backgroundColor: 'rgba(20, 20, 25, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1
    },
    compactTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        color: COLORS.textPrim,
        letterSpacing: 0.5,
        width: '100%'
    },
    compactInput: {
        flex: 1,
        marginBottom: 0,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 14,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12
    },
    compactButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: COLORS.textHighlight,
    }
});
