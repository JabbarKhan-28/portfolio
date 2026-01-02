import { COLORS } from "@/constants/theme";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface ResumeItemProps {
  role: string;
  company: string;
  date: string;
  desc: string;
}

export default function ResumeItem({
  role,
  company,
  date,
  desc,
}: ResumeItemProps) {
  return (
    <View style={styles.resumeItem}>
      <Text style={styles.itemRole}>{role}</Text>
      <View style={styles.itemMeta}>
        <Text style={styles.itemCompany}>{company}</Text>
        <Text style={styles.itemDate}>{date}</Text>
      </View>
      <Text style={styles.itemDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  resumeItem: {
    marginBottom: 30,
    width: '100%'
  },
  itemRole: {
    color: COLORS.textPrim,
    fontSize: Platform.OS === 'android' ? 22 : 22,
    fontWeight: "800",
    marginBottom: 5
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 10
  },
  itemCompany: {
    color: COLORS.textHighlight,
    fontWeight: "700",
    fontSize: 16
  },
  itemDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8
  },
  itemDesc: {
    color: COLORS.textSec,
    fontSize: 15,
    lineHeight: 24,
  },
});
