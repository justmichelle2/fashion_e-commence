import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../utils/currency';
import { timeAgo } from '../utils/format';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { StatusBadge } from './StatusBadge';

export function OrderCard({ order, onPress }) {
  if (!order) return null;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title}>Order #{order.id.slice(0, 6)}</Text>
        <StatusBadge status={order.status} />
      </View>
      <Text style={styles.subtitle} numberOfLines={1}>
        {order.items?.map((item) => item.title).join(', ') || 'Custom look'}
      </Text>
      <View style={styles.row}>
        <Text style={styles.price}>{formatCurrency(order.totalCents, order.currency)}</Text>
        <Text style={styles.muted}>{timeAgo(order.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  muted: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
