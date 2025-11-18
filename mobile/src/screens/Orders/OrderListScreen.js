import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../../api/orders';
import { OrderCard } from '../../components/OrderCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function OrderListScreen() {
  const navigation = useNavigation();
  const query = useQuery(['orders'], fetchOrders);

  if (query.isLoading) return <LoadingState />;

  return (
    <FlatList
      data={query.data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Track every stage from paid to delivery.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />
      )}
      ListEmptyComponent={<EmptyState title="No orders" subtitle="Start shopping to see updates" />}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
});
