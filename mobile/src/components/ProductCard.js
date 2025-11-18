import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { formatCurrency } from '../utils/currency';
import { resolveAssetUrl } from '../api/client';

export function ProductCard({ product, onPress, onAddToCart }) {
  if (!product) return null;
  const price = formatCurrency(product.priceCents, product.currency);
  const resolvedImage = product.images?.[0] ? resolveAssetUrl(product.images[0]) : null;
  const imageSource = resolvedImage ? { uri: resolvedImage } : null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      {imageSource ? (
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {product.title}
        </Text>
        <Text style={styles.subtitle}>{product.designerName || 'Independent designer'}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.price}>{price}</Text>
          {onAddToCart ? (
            <TouchableOpacity onPress={onAddToCart}>
              <Text style={styles.cta}>Add</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: spacing.sm,
    marginRight: spacing.md,
    width: 220,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  meta: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footerRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  cta: {
    color: colors.accent,
    fontWeight: '600',
  },
});
