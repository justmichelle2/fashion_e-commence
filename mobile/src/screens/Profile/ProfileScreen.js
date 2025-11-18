import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function ProfileScreen() {
  const { user, logout } = useAuthContext();
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role}</Text>
        <TouchableOpacity style={styles.settings} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsText}>Account settings →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Measurements</Text>
        {user?.measurementProfile?.bust ? (
          Object.entries(user.measurementProfile).map(([key, value]) => (
            <View style={styles.row} key={key}>
              <Text style={styles.rowLabel}>{key}</Text>
              <Text style={styles.rowValue}>{value}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>Add measurements to unlock precise fittings.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: spacing.lg,
    gap: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  email: {
    color: colors.textMuted,
  },
  role: {
    color: colors.accent,
    fontWeight: '600',
  },
  settings: {
    marginTop: spacing.sm,
  },
  settingsText: {
    color: colors.accent,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabel: {
    color: colors.textMuted,
  },
  rowValue: {
    color: colors.text,
    fontWeight: '600',
  },
  muted: {
    color: colors.textMuted,
  },
  logoutButton: {
    padding: spacing.md,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
