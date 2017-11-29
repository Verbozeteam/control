# Verboze Control

React Native application run on Android tablets.
This first iteration is tailored for hotels.

# Installation
- Make sure you have `npm` installed and run `npm install` to obtain the latest dependencies.

# Creating a Release Build
- You must first generate a signing key. This need not be done more than once.
  At the root directory, run the following:
  `cd android/app`
  `keytool -genkey -v -keystore VerbozeControlDev.keystore -alias VerbozeControlDev -keyalg RSA -keysize 2048 -validity 10000`

  Make sure `VerbozeControlDev.keystore` is located in `/android/app`.

- If you have the signing key, run the following command from the root directory to create a release build:
  `cd android && ./gradlew assembleRelease`

  Navigate to `/android/app/build/outputs/apk/` to find `app-release.apk`. Congratulations, you've built a React Native Android app. Good job buddy. Pat yourself on the shoulder if you're Hasan.

- To install your newly created release build on an Android device, run the following:
  `adb install </android/app/build/outputs/apk/app-release.apk || path_to_apk>`

- To take things one step further, if you want to run your newly created release build on the Android device from the command line, run the following:
  `adb shell am start -n com.verbozecontrol/com.verbozecontrol.MainActivity`
