import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { NotificationsScreen } from '../screens/Home/NotificationsScreen';
import { DesignerDetailScreen } from '../screens/Home/DesignerDetailScreen';

const Stack = createNativeStackNavigator();

export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeFeed" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="DesignerDetail" component={DesignerDetailScreen} options={{ title: 'Designer' }} />
    </Stack.Navigator>
  );
}
