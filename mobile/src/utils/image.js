import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(uri) {
  if (!uri) return null;
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.65, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (err) {
    console.warn('compressImage error', err);
    return uri;
  }
}
