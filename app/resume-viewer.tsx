import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PdfViewerScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // Resume URL from params or default constants
    // Ideally we pass it via params, but we can also import the constant if we want to be strict.
    // For now, let's grab the URL from the query param "url"
    const pdfUrl = params.url as string;

    if (!pdfUrl) {
        return (
            <View style={styles.container}>
                <Text style={{color: '#FFF'}}>No URL provided</Text>
            </View>
        );
    }

    // Use the URL directly (User requested no Google Drive wrapper)
    const viewerUrl = pdfUrl;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrim} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Resume Preview</Text>
                <View style={{width: 40}} />
            </View>

            {/* Viewer */}
            <View style={styles.viewerContainer}>
                 {Platform.OS === 'web' ? (
                     <iframe
                         src={pdfUrl}
                         title="PDF Viewer"
                         style={{ width: "100%", height: "100%", border: "none" }}
                     />
                 ) : (
                     <WebView 
                         source={{ uri: viewerUrl }}
                         style={{ flex: 1, backgroundColor: COLORS.darkBg }}
                         startInLoadingState={true}
                         renderLoading={() => (
                            <View style={styles.loader}>
                                <ActivityIndicator size="large" color={COLORS.textHighlight} />
                            </View>
                         )}
                     />
                 )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primaryBg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.cardBg,
    },
    headerTitle: {
        color: COLORS.textPrim,
        fontSize: 18,
        fontWeight: 'bold',
    },
    backBtn: {
        padding: 5,
    },
    viewerContainer: {
        flex: 1,
    },
    loader: {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: COLORS.primaryBg
    }
});
