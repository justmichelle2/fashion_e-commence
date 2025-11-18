import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const mockNotifications = [
  { id: '1', title: 'Order shipped', body: 'Your silk evening gown is on the way.' },
  { id: '2', title: 'Designer update', body: 'Camila added new sketches to your custom order.' },
  { id: '3', title: 'Payment received', body: 'Thanks for completing your payment.' },
];

export function NotificationsScreen() {
  return (
    <FlatList
      data={mockNotifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing.lg }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  body: {
    color: colors.textMuted,
  },
});
