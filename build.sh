#!/bin/bash
ionic cordova build --release android
echo "snowheight" | jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore snowheight.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk snowheight_keystore
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk SnowHeight.apk
