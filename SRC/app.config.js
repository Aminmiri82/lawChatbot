export default ({ config }) => ({
    ...config,
    name: "Persian Legal Guide",
    slug: "persian-legal-guide",
    version: "1.0.0",
    runtimeVersion: "1.0.3",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      usesIcloudStorage: true,
      bundleIdentifier: "com.amin04.SRC",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.amin04.SRC"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "37368c89-9a1c-4b62-ac73-447f85b72c40"
      },
      router: {
        origin: false
      }
    },
    updates: {
      url: "https://u.expo.dev/f36a631d-a4fc-4389-b325-84364c9deb7e"
    },
    plugins: [
      "expo-router",
      "expo-document-picker",
      "expo-asset",
      "expo-secure-store"
    ],
    owner: "alirad"
  });
  