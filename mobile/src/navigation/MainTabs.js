import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { ShopStack } from './ShopStack';
import { CreateStack } from './CreateStack';
import { OrdersStack } from './OrdersStack';
import { ProfileStack } from './ProfileStack';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const tabIcons = {
  HomeTab: 'home-outline',
  ShopTab: 'grid-outline',
  CreateTab: 'color-wand-outline',
  OrdersTab: 'bag-check-outline',
  ProfileTab: 'person-circle-outline',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: 'rgba(17,24,39,0.05)',
          height: 62,
          paddingBottom: 6,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = tabIcons[route.name] || 'ellipse-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="ShopTab" component={ShopStack} options={{ title: 'Shop' }} />
      <Tab.Screen name="CreateTab" component={CreateStack} options={{ title: 'Create' }} />
      <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ title: 'Orders' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
