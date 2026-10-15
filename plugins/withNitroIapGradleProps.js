/**
 * Expo config plugin: withNitroIapGradleProps
 *
 * react-native-iap v17 (Nitro) reads nine `NitroIap_*` Gradle properties at
 * Android configuration time. Its buildscript block throws
 * `GradleException("react-native-iap: missing NitroIap_<name> in
 * android/gradle.properties")` for `androidGradlePluginVersion` and
 * `kotlinVersion` when they are absent from the root project's
 * android/gradle.properties (Expo prebuild never sets them), which fails
 * the whole Android build before any compilation starts.
 *
 * This plugin appends all nine properties to android/gradle.properties at
 * prebuild time. Values match this project:
 * - AGP / Kotlin: pinned to the exact versions in React Native 0.86's
 *   version catalog (node_modules/react-native/gradle/libs.versions.toml),
 *   which is what the rest of the Android build already uses.
 * - compileSdk / minSdk / targetSdk: from app.json (expo-build-properties).
 * - coroutines / play-services-base / junit / ndk: react-native-iap's own
 *   shipped defaults (its android/gradle.properties) — what the library
 *   was built and tested against.
 */
const { withGradleProperties, createRunOncePlugin } = require('@expo/config-plugins');

const NITRO_IAP_PROPS = {
  NitroIap_androidGradlePluginVersion: '8.12.0',
  NitroIap_kotlinVersion: '2.1.20',
  NitroIap_coroutinesVersion: '1.11.0',
  NitroIap_playServicesBaseVersion: '18.10.0',
  NitroIap_junitVersion: '4.13.2',
  NitroIap_minSdkVersion: '24',
  NitroIap_targetSdkVersion: '36',
  NitroIap_compileSdkVersion: '36',
  NitroIap_ndkVersion: '27.1.12297006',
};

const withNitroIapGradleProps = (config) =>
  withGradleProperties(config, (config) => {
    for (const [key, value] of Object.entries(NITRO_IAP_PROPS)) {
      const existing = config.modResults.find((p) => p && p.key === key);
      if (existing) {
        existing.value = value;
      } else {
        config.modResults.push({ type: 'property', key, value });
      }
    }
    return config;
  });

module.exports = createRunOncePlugin(
  withNitroIapGradleProps,
  'with-nitro-iap-gradle-props',
  '1.0.0'
);
