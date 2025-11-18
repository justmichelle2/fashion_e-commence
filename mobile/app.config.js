// Expo SDK 54 config (React Native 0.81 / React 19) keeps Android API level 34+ defaults.
// TODO(sec): monitor Expo release notes for any follow-up security patches beyond SDK 54.

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.length > 0) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'http://localhost:5000/api';
};

module.exports = () => ({
  expo: {
    name: 'Fashion Mobile',
    slug: 'fashion-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'fashionmobile',
    jsEngine: 'hermes',
    platforms: ['ios', 'android', 'web'],
    assetBundlePatterns: ['**/*'],
    runtimeVersion: {
      policy: 'appVersion',
    },
    ios: {
      supportsTablet: true,
      deploymentTarget: '13.4',
    },
    android: {
      package: 'com.fashionecomm.mobile',
      targetSdkVersion: 34,
    },
    extra: {
      apiUrl: getApiUrl(),
    },
  },
});
