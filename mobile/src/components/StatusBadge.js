import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const statusStyles = {
  pending_payment: { backgroundColor: '#FEF3C7', color: '#92400E' },
  paid: { backgroundColor: '#DCFCE7', color: '#166534' },
  in_production: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  waiting_for_review: { backgroundColor: '#E0E7FF', color: '#4338CA' },
  shipped: { backgroundColor: '#FFE4E6', color: '#BE123C' },
  delivered: { backgroundColor: '#ECFDF5', color: '#047857' },
  cancelled: { backgroundColor: '#F3F4F6', color: '#1F2937' },
  refunded: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  dispute_opened: { backgroundColor: '#FEE2E2', color: '#7F1D1D' },
};

export function StatusBadge({ status }) {
  const normalized = status?.toLowerCase?.() || 'pending';
  const palette = statusStyles[normalized] || { backgroundColor: '#E5E7EB', color: '#111827' };
  return (
    <View style={[styles.container, { backgroundColor: palette.backgroundColor }]}> 
      <Text style={[styles.label, { color: palette.color }]}>{normalized.replace(/_/g, ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
