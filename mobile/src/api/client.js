import axios from 'axios';
import Constants from 'expo-constants';

const manifest = Constants?.manifest2 || Constants?.manifest || {};
const expoConfig = Constants?.expoConfig || manifest || {};

const inferLanApiUrl = () => {
  const hostCandidates = [
    Constants?.expoConfig?.hostUri,
    manifest?.extra?.expoGo?.developer?.host,
    manifest?.hostUri,
    manifest?.debuggerHost,
  ].filter(Boolean);

  if (!hostCandidates.length) return null;
  const hostWithPort = hostCandidates[0];
  const hostname = hostWithPort.split(':')[0];
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') return null;
  return `http://${hostname}:5000/api`;
};

const defaultBase = expoConfig?.extra?.apiUrl || inferLanApiUrl() || 'http://localhost:5000/api';
const baseUrl = process.env.EXPO_PUBLIC_API_URL || defaultBase;
const serverBase = baseUrl.replace(/\/api\/?$/, '') || baseUrl;

const client = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
});

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function resolveAssetUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${serverBase}${trimmed}`;
}

client.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
