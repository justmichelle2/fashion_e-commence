import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products';
import { ProductCard } from '../../components/ProductCard';
import { FilterChip } from '../../components/FilterChip';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDebounce } from '../../hooks/useDebounce';

const categories = ['all', 'evening', 'bridal', 'street', 'sustainable'];

export function ProductListScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const debouncedQuery = useDebounce(search, 350);

  const productsQuery = useQuery(['products', debouncedQuery, category], () =>
    fetchProducts({
      q: debouncedQuery || undefined,
      category: category === 'all' ? undefined : category,
      limit: 30,
    })
  );

  const header = (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Tailored fashion drops, curated for you.</Text>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.search}
          placeholder="Search fabrics, silhouettes, designers"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
        {categories.map((item) => (
          <FilterChip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.cartButtonText}>Go to cart</Text>
      </TouchableOpacity>
    </View>
  );

  if (productsQuery.isLoading) return <LoadingState />;

  return (
    <FlatList
      data={productsQuery.data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          onAddToCart={() => navigation.navigate('ProductDetail', { productId: item.id })}
        />
      )}
      ListEmptyComponent={<EmptyState title="No products" subtitle="Try another search" />}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  searchWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  search: {
    height: 48,
    fontSize: 15,
    color: colors.text,
  },
  cartButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  cartButtonText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
