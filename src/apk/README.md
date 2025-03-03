
# Mobile App Distribution Files

This directory is intended for mobile app distribution files (.apk for Android and .ipa for iOS).

To generate these files, you need to:

1. Set up Capacitor in your project:
   ```
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. Add platforms:
   ```
   npx cap add android
   npx cap add ios
   ```

3. Build your web app:
   ```
   npm run build
   ```

4. Sync with Capacitor:
   ```
   npx cap sync
   ```

5. Open in native IDEs:
   ```
   npx cap open android
   npx cap open ios
   ```

6. Build from the native IDEs (Android Studio, Xcode)

See the [Capacitor documentation](https://capacitorjs.com/docs) 

Download Apk...
https://github.com/CUBIZ-G/multiprojectassociation/blob/main/src/apk/MPA.v.1.apk

https://drive.google.com/uc?id=1rhoD4s2jTh2deIZ1VqnWJjUDSST04lCq
