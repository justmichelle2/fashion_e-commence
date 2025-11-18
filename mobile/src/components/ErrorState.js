import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function ErrorState({ message = 'Something went wrong' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
  },
  text: {
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
});
