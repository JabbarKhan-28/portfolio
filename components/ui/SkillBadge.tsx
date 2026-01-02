import { COLORS } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

interface SkillBadgeProps {
  name: string;
}

export default function SkillBadge({ name }: SkillBadgeProps) {
    const { width } = useWindowDimensions();
    return (
        <View style={[styles.badge, { 
          paddingVertical: width < 450 ? 8 : 12,
          paddingHorizontal: width < 450 ? 14 : 20,
          minWidth: width < 450 ? 80 : 100
        }]}>
            <Text style={styles.badgeText}>{name}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  badge: {
      backgroundColor: 'rgba(45, 212, 191, 0.1)', // Cyan tint for better visual
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(45, 212, 191, 0.2)',
      alignItems: 'center'
  },
  badgeText: {
      color: COLORS.textPrim,
      fontWeight: '700',
      fontSize: 15
  },
});
