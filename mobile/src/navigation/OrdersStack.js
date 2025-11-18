import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrderListScreen } from '../screens/Orders/OrderListScreen';
import { OrderDetailScreen } from '../screens/Orders/OrderDetailScreen';

const Stack = createNativeStackNavigator();

export function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Orders" component={OrderListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order detail' }} />
    </Stack.Navigator>
  );
}
