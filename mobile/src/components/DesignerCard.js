import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { initialsFromName } from '../utils/format';

export function DesignerCard({ designer, onPress }) {
  if (!designer) return null;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initialsFromName(designer.name)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{designer.name}</Text>
        <Text style={styles.bio} numberOfLines={2}>
          {designer.bio || 'Specializes in bespoke couture looks.'}
        </Text>
        {designer.verified ? <Text style={styles.verified}>Verified designer</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: colors.textMuted,
  },
  verified: {
    marginTop: 6,
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
});
