import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { useAuthContext } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { LoadingState } from '../components/LoadingState';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
  },
};

export function RootNavigator() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <NavigationContainer theme={navTheme}>{user ? <MainTabs /> : <AuthNavigator />}</NavigationContainer>
  );
}
