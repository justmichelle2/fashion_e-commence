import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { uploadLocal } from '../../api/uploads';
import { compressImage } from '../../utils/image';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function InspoUploadScreen() {
  const [images, setImages] = useState([]);
  const mutation = useMutation({
    mutationFn: uploadLocal,
    onSuccess: () => Alert.alert('Uploaded', 'Image added to your inspiration tray.'),
    onError: () => Alert.alert('Upload failed', 'Try again with a smaller image.'),
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to upload inspo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const uploadAll = async () => {
    for (const img of images) {
      const compressed = await compressImage(img.uri);
      await mutation.mutateAsync(compressed);
    }
    setImages([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload inspo</Text>
      <Text style={styles.subtitle}>Share references from your camera roll.</Text>
      <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
        <Text style={styles.pickButtonText}>Select photo</Text>
      </TouchableOpacity>
      <View style={styles.previewGrid}>
        {images.map((img) => (
          <Image key={img.uri} source={{ uri: img.uri }} style={styles.preview} />
        ))}
      </View>
      {images.length ? (
        <PrimaryButton title="Upload references" onPress={uploadAll} loading={mutation.isLoading} />
      ) : null}
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
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  pickButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
  },
  pickButtonText: {
    color: colors.accent,
    fontWeight: '600',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  preview: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
  },
});
