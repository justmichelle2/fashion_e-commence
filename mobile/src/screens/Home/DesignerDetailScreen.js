import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchDesigner } from '../../api/designers';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { ProductCard } from '../../components/ProductCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export function DesignerDetailScreen() {
  const route = useRoute();
  const designerId = route.params?.designerId;
  const query = useQuery(['designer', designerId], () => fetchDesigner(designerId), {
    enabled: Boolean(designerId),
  });

  if (query.isLoading) return <LoadingState />;
  if (!query.data) return <EmptyState title="Designer not found" />;

  const { designer, products } = query.data;

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.lg }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.name}>{designer.name}</Text>
          {designer.bio ? <Text style={styles.bio}>{designer.bio}</Text> : null}
          {designer.portfolioUrl ? (
            <Text style={styles.link}>{designer.portfolioUrl}</Text>
          ) : (
            <Text style={styles.linkMuted}>Portfolio coming soon</Text>
          )}
          <Text style={styles.sectionTitle}>Looks</Text>
        </View>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
      ListEmptyComponent={<EmptyState title="No looks yet" subtitle="Check again later" />}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  bio: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  link: {
    color: colors.accent,
    marginBottom: spacing.lg,
  },
  linkMuted: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
