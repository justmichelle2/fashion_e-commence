import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../context/AuthContext';
import { fetchTrendingProducts } from '../../api/products';
import { fetchDesigners } from '../../api/designers';
import { fetchOrders } from '../../api/orders';
import { ProductCard } from '../../components/ProductCard';
import { DesignerCard } from '../../components/DesignerCard';
import { SectionHeader } from '../../components/SectionHeader';
import { OrderCard } from '../../components/OrderCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuthContext();

  const trendingQuery = useQuery(['trending-products'], fetchTrendingProducts);
  const designerQuery = useQuery(['designers'], fetchDesigners);
  const ordersQuery = useQuery(['latest-orders'], async () => {
    const orders = await fetchOrders();
    return orders.slice(0, 3);
  });

  if (trendingQuery.isLoading) {
    return <LoadingState />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <LinearGradient colors={['#111827', '#1F2937']} style={styles.hero}>
        <Text style={styles.greeting}>Hi {user?.name?.split(' ')[0] || 'there'} 👋</Text>
        <Text style={styles.headline}>Your custom fashion studio, everywhere.</Text>
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.heroButtonPrimary}
            onPress={() => navigation.navigate('CreateTab', { screen: 'DesignerRequest' })}
          >
            <Text style={styles.heroButtonText}>Request look</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroButtonSecondary}
            onPress={() => navigation.navigate('CreateTab', { screen: 'InspoUpload' })}
          >
            <Text style={styles.heroButtonSecondaryText}>Upload inspo</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SectionHeader title="Trending now" actionLabel="See all" onActionPress={() => navigation.navigate('ShopTab')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.xl }}>
        {trendingQuery.data?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => navigation.navigate('ShopTab', { screen: 'ProductDetail', params: { productId: product.id } })}
          />
        ))}
      </ScrollView>

      <SectionHeader title="Featured designers" actionLabel="Browse" onActionPress={() => navigation.navigate('CreateTab')} />
      {designerQuery.isLoading ? (
        <LoadingState />
      ) : designerQuery.data?.length ? (
        designerQuery.data.slice(0, 4).map((designer) => (
          <DesignerCard
            key={designer.id}
            designer={designer}
            onPress={() =>
              navigation.navigate('HomeTab', { screen: 'DesignerDetail', params: { designerId: designer.id } })
            }
          />
        ))
      ) : (
        <EmptyState title="No designers yet" subtitle="Check back again soon" />
      )}

      <SectionHeader
        title="Latest orders"
        actionLabel="View all"
        onActionPress={() => navigation.navigate('OrdersTab')}
      />
      {ordersQuery.isLoading ? (
        <LoadingState />
      ) : ordersQuery.data?.length ? (
        ordersQuery.data.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => navigation.navigate('OrdersTab', { screen: 'OrderDetail', params: { orderId: order.id } })}
          />
        ))
      ) : (
        <EmptyState title="No orders yet" subtitle="Start by adding something to your cart" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    padding: spacing.lg,
    borderRadius: 28,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  greeting: {
    fontSize: 16,
    color: '#F3F4F6',
    marginBottom: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.md,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroButtonPrimary: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  heroButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  heroButtonSecondary: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  heroButtonSecondaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
