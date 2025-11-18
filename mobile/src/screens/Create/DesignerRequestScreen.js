import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { createCustomOrder } from '../../api/customOrders';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function DesignerRequestScreen() {
  const route = useRoute();
  const [form, setForm] = useState({
    title: '',
    description: '',
    notes: '',
    size: '',
    colorPalette: '',
    fabricPreference: '',
    inspirationImages: [],
    designerId: route.params?.designerId,
  });

  const mutation = useMutation({
    mutationFn: createCustomOrder,
    onSuccess: () => Alert.alert('Request sent', 'Designers will reach out soon!'),
    onError: (err) => Alert.alert('Unable to submit', err?.response?.data?.error || 'Try again'),
  });

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = () => {
    if (!form.title || !form.description) {
      Alert.alert('Missing info', 'Add a title and description.');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Custom request</Text>
      <Text style={styles.subtitle}>Share your inspiration and measurements.</Text>
      <TextField label="Project title" value={form.title} onChangeText={(text) => setField('title', text)} />
      <TextField
        label="Project description"
        value={form.description}
        onChangeText={(text) => setField('description', text)}
        multiline
      />
      <TextField label="Notes" value={form.notes} onChangeText={(text) => setField('notes', text)} multiline />
      <TextField label="Preferred size" value={form.size} onChangeText={(text) => setField('size', text)} />
      <TextField
        label="Color palette"
        value={form.colorPalette}
        onChangeText={(text) => setField('colorPalette', text)}
      />
      <TextField
        label="Fabric preference"
        value={form.fabricPreference}
        onChangeText={(text) => setField('fabricPreference', text)}
      />
      <PrimaryButton title="Submit request" onPress={submit} loading={mutation.isLoading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
});
