import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductListScreen } from '../screens/Shop/ProductListScreen';
import { ProductDetailScreen } from '../screens/Shop/ProductDetailScreen';
import { CartScreen } from '../screens/Shop/CartScreen';
import { CheckoutScreen } from '../screens/Shop/CheckoutScreen';

const Stack = createNativeStackNavigator();

export function ShopStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Products" component={ProductListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
}
