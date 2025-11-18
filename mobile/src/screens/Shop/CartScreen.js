import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCart, removeFromCart } from '../../api/orders';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { PrimaryButton } from '../../components/PrimaryButton';

export function CartScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const cartQuery = useQuery(['cart'], fetchCart);

  const removeMutation = useMutation({
    mutationFn: (productId) => removeFromCart(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (cartQuery.isLoading) return <LoadingState />;
  const cart = cartQuery.data;

  if (!cart || !cart.items?.length) {
    return <EmptyState title="Your cart is empty" subtitle="Add pieces from the shop" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>Qty {item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.priceCents * item.quantity, cart.currency)}</Text>
            </View>
            <TouchableOpacity onPress={() => removeMutation.mutate(item.productId)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.summary}>
        <Row label="Subtotal" value={formatCurrency(cart.subtotalCents, cart.currency)} />
        <Row label="Shipping" value={formatCurrency(cart.shippingCents, cart.currency)} />
        <Row label="Tax" value={formatCurrency(cart.taxCents, cart.currency)} />
        <Row label="Total" value={formatCurrency(cart.totalCents, cart.currency)} bold />
        <PrimaryButton title="Checkout" onPress={() => navigation.navigate('Checkout')} />
      </View>
    </View>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  itemSubtitle: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  itemPrice: {
    fontWeight: '600',
    color: colors.primary,
  },
  remove: {
    color: colors.danger,
  },
  summary: {
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.textMuted,
  },
  rowValue: {
    color: colors.text,
    fontWeight: '600',
  },
  rowBold: {
    fontSize: 18,
  },
});
