import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchDesigners } from '../../api/designers';
import { DesignerCard } from '../../components/DesignerCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function DesignerDirectoryScreen() {
  const navigation = useNavigation();
  const query = useQuery(['designers'], fetchDesigners);

  if (query.isLoading) return <LoadingState />;

  return (
    <FlatList
      data={query.data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.lg }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Partner with a designer</Text>
          <Text style={styles.subtitle}>Browse curated ateliers and send a custom brief.</Text>
          <PrimaryButton
            title="New custom request"
            onPress={() => navigation.navigate('DesignerRequest')}
            style={{ marginTop: spacing.md }}
          />
        </View>
      }
      renderItem={({ item }) => (
        <DesignerCard
          designer={item}
          onPress={() => navigation.navigate('DesignerRequest', { designerId: item.id })}
        />
      )}
      ListEmptyComponent={<EmptyState title="No designers yet" subtitle="Hang tight" />}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
  },
});
