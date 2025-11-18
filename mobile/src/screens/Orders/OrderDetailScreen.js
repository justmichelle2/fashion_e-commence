import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '../../api/orders';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { timeAgo } from '../../utils/format';

export function OrderDetailScreen() {
  const route = useRoute();
  const orderId = route.params?.orderId;
  const query = useQuery(['order', orderId], () => fetchOrder(orderId), { enabled: Boolean(orderId) });

  if (query.isLoading) return <LoadingState />;
  if (!query.data) return <EmptyState title="Order not found" />;

  const order = query.data;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderTitle}>Order #{order.id.slice(0, 6)}</Text>
          <Text style={styles.meta}>{timeAgo(order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <Text style={styles.section}>Items</Text>
      {order.items?.map((item) => (
        <View style={styles.item} key={item.productId}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemMeta}>
            {item.quantity} × {formatCurrency(item.priceCents, order.currency)}
          </Text>
        </View>
      ))}

      <Text style={styles.section}>Summary</Text>
      <SummaryRow label="Subtotal" value={formatCurrency(order.subtotalCents, order.currency)} />
      <SummaryRow label="Shipping" value={formatCurrency(order.shippingCents, order.currency)} />
      <SummaryRow label="Tax" value={formatCurrency(order.taxCents, order.currency)} />
      <SummaryRow label="Total" value={formatCurrency(order.totalCents, order.currency)} bold />

      <Text style={styles.section}>Timeline</Text>
      <FlatList
        data={buildTimeline(order)}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, item.done && styles.timelineDotActive]} />
            <View>
              <Text style={[styles.timelineLabel, item.done && styles.timelineLabelActive]}>{item.label}</Text>
              {item.subtitle ? <Text style={styles.timelineSubtitle}>{item.subtitle}</Text> : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

function buildTimeline(order) {
  const steps = [
    { key: 'pending_payment', label: 'Payment pending' },
    { key: 'paid', label: 'Payment confirmed' },
    { key: 'in_production', label: 'In production' },
    { key: 'waiting_for_review', label: 'Awaiting approval' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return steps.map((step) => ({
    label: step.label,
    done: statusOrderIndex(order.status) >= statusOrderIndex(step.key),
    subtitle: order.status === step.key ? 'Current stage' : undefined,
  }));
}

const orderStatuses = [
  'cart',
  'pending_payment',
  'paid',
  'in_production',
  'waiting_for_review',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'dispute_opened',
];

function statusOrderIndex(status) {
  return Math.max(0, orderStatuses.indexOf(status));
}

function SummaryRow({ label, value, bold }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  orderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: '700',
    color: colors.text,
    fontSize: 16,
  },
  item: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  itemMeta: {
    color: colors.textMuted,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: colors.textMuted,
  },
  summaryValue: {
    color: colors.text,
  },
  bold: {
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineLabel: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  timelineLabelActive: {
    color: colors.text,
  },
  timelineSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
