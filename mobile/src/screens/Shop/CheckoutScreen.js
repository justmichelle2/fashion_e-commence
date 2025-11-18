import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { checkout } from '../../api/orders';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function CheckoutScreen() {
  const navigation = useNavigation();
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card_on_file');

  const mutation = useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      Alert.alert('Success', 'Your payment is pending confirmation.');
      navigation.navigate('OrdersTab');
    },
    onError: (err) => Alert.alert('Checkout failed', err?.response?.data?.error || 'Try again'),
  });

  const submit = () => {
    if (!shippingAddress) {
      Alert.alert('Missing info', 'Please add a shipping address.');
      return;
    }
    mutation.mutate({ shippingAddress, paymentMethod });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Confirm delivery info and payment preference.</Text>
      <TextField
        label="Shipping address"
        multiline
        value={shippingAddress}
        onChangeText={setShippingAddress}
        placeholder="123 Fashion Ave, New York, NY"
      />
      <TextField
        label="Payment method"
        value={paymentMethod}
        onChangeText={setPaymentMethod}
        helperText="Example: card_on_file, pay_in_full"
      />
      <PrimaryButton title="Submit payment" onPress={submit} loading={mutation.isLoading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
});
