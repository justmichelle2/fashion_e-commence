import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProduct } from '../../api/products';
import { addToCart } from '../../api/orders';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/currency';
import { resolveAssetUrl } from '../../api/client';

export function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const productId = route.params?.productId;
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const productQuery = useQuery(['product', productId], () => fetchProduct(productId), {
    enabled: Boolean(productId),
  });

  const addMutation = useMutation({
    mutationFn: ({ pid, qty }) => addToCart(pid, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigation.navigate('Cart');
    },
  });

  if (productQuery.isLoading || !productQuery.data) return <LoadingState />;

  const product = productQuery.data;
  const price = formatCurrency(product.priceCents * quantity, product.currency);
  const primaryImageUri = product.images?.[0] ? resolveAssetUrl(product.images[0]) : null;
  const primaryImage = primaryImageUri
    ? { uri: primaryImageUri }
    : { uri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=60' };

  const handleAdd = () => {
    addMutation.mutate({ pid: product.id, qty: quantity });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }} style={styles.container}>
      <Image source={primaryImage} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.designer}>{product.designerName || 'Independent designer'}</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={[styles.qtyButton, quantity === 1 && styles.qtyDisabled]}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity === 1}
          >
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity((q) => Math.min(10, q + 1))}>
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>
        <PrimaryButton title="Add to cart" onPress={handleAdd} loading={addMutation.isLoading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: {
    width: '100%',
    height: 360,
    backgroundColor: colors.border,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  designer: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyDisabled: {
    opacity: 0.4,
  },
  qtyText: {
    fontSize: 20,
    color: colors.text,
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
