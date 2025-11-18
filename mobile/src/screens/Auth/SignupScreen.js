import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuthContext } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const roles = [
  { key: 'customer', label: 'Customer' },
  { key: 'designer', label: 'Designer' },
];

export function SignupScreen() {
  const navigation = useNavigation();
  const { register, authError } = useAuthContext();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.name) {
      Alert.alert('Missing fields', 'Add your name, email, and password.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, role: form.role });
    } catch (err) {
      // handled globally
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Personalize your shopping, track orders, and collaborate with designers.</Text>
        <TextField label="Full name" value={form.name} onChangeText={(text) => setField('name', text)} />
        <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(text) => setField('email', text)} />
        <TextField label="Password" secureTextEntry value={form.password} onChangeText={(text) => setField('password', text)} />
        <Text style={styles.roleLabel}>Sign up as</Text>
        <View style={styles.roleRow}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[styles.roleChip, form.role === role.key && styles.roleChipActive]}
              onPress={() => setField('role', role.key)}
            >
              <Text style={[styles.roleText, form.role === role.key && styles.roleTextActive]}>{role.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {authError ? <Text style={styles.error}>{authError}</Text> : null}
        <PrimaryButton title="Create account" onPress={handleSubmit} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  back: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  roleLabel: {
    marginBottom: spacing.sm,
    fontWeight: '600',
    color: colors.text,
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  roleChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    color: colors.text,
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#fff',
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});
