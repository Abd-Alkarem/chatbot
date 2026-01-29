# Build Android APK Guide

This guide will help you create an Android APK for the chat app.

## Prerequisites

1. **Node.js** installed (v16 or higher)
2. **Android Studio** installed
3. **Java JDK** (version 11 or higher)

## Method 1: Using Capacitor (Recommended)

### Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### Step 2: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- App name: `Chat App`
- App ID: `com.chatapp.mobile` (or your preferred package name)
- Web directory: `public`

### Step 3: Add Android Platform

```bash
npx cap add android
```

### Step 4: Copy Web Assets

```bash
npx cap copy android
```

### Step 5: Open in Android Studio

```bash
npx cap open android
```

### Step 6: Build APK in Android Studio

1. In Android Studio, go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to complete
3. Click **locate** to find your APK file
4. The APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 7: Install on Device

Transfer the APK to your Android device and install it.

## Method 2: Using Cordova

### Step 1: Install Cordova

```bash
npm install -g cordova
```

### Step 2: Create Cordova Project

```bash
cordova create chatapp com.chatapp.mobile ChatApp
cd chatapp
```

### Step 3: Copy Your Files

Copy all files from the `public` folder to `chatapp/www/`

### Step 4: Add Android Platform

```bash
cordova platform add android
```

### Step 5: Build APK

```bash
cordova build android
```

The APK will be in: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

## Method 3: Quick APK (Using Online Tools)

If you want a quick APK without installing Android Studio:

1. Go to **https://www.websitetoapk.com/** or **https://appsgeyser.com/**
2. Enter your deployed Railway URL: `https://your-app.railway.app`
3. Customize app name, icon, and colors
4. Download the generated APK

## Configuration Files

The following files have been created for you:

- `capacitor.config.json` - Capacitor configuration
- `android-config.xml` - Android app configuration
- `package.json` - Updated with Capacitor dependencies

## Important Notes

### For Production APK:

1. **Update Server URL**: In `public/script.js`, change:
   ```javascript
   const socket = io('https://your-app.railway.app');
   ```

2. **Enable HTTPS**: Make sure your Railway app uses HTTPS (it does by default)

3. **Sign the APK**: For Google Play Store, you need a signed release APK:
   ```bash
   # Generate keystore
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   
   # Build signed APK
   cd android
   ./gradlew assembleRelease
   ```

4. **App Permissions**: The app needs these permissions (already configured):
   - Internet access
   - Microphone (for voice chat)
   - Storage (for caching)

## Testing

1. **Debug APK**: Use for testing on your devices
2. **Release APK**: Use for distribution or Play Store

## Troubleshooting

### Build Fails
- Make sure Android SDK is installed
- Check Java version: `java -version`
- Update Gradle if needed

### App Crashes on Launch
- Check server URL is correct
- Ensure HTTPS is enabled
- Check browser console in Android Studio

### Voice Chat Not Working
- Grant microphone permissions in app settings
- Ensure HTTPS connection
- Test on physical device (not emulator)

## Quick Start Commands

```bash
# Install dependencies
npm install

# Add Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init

# Add Android
npx cap add android

# Sync files
npx cap sync

# Open in Android Studio
npx cap open android

# Build APK
# (Do this in Android Studio: Build → Build APK)
```

## Download Pre-built APK

Once you build the APK, you can share it by:
1. Uploading to Google Drive
2. Hosting on your website
3. Using a file sharing service
4. Publishing to Google Play Store

Your APK will be ready to install on any Android device!
