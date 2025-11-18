import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useAuthContext } from '../../context/AuthContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function SettingsScreen() {
  const { refreshProfile } = useAuthContext();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Push alerts</Text>
        <Switch value={pushEnabled} onValueChange={setPushEnabled} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email updates</Text>
        <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
      </View>
      <PrimaryButton title="Refresh profile" onPress={refreshProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
});
