import client from './client';
import * as FileSystem from 'expo-file-system';

export async function uploadLocal(uri) {
  if (!uri) throw new Error('Missing uri');
  const fileInfo = await FileSystem.getInfoAsync(uri);
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: uri.split('/').pop() || 'upload.jpg',
    type: 'image/jpeg',
  });

  const { data } = await client.post('/uploads/local', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(fileInfo.size ? { 'Content-Length': String(fileInfo.size) } : {}),
    },
  });
  return data.url;
}
