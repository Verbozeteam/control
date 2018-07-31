# Break on first error
set -e

do_bundle=1
do_assemble=1
debug=0
commit=`git rev-parse HEAD`

# Parse the command line
while [ "$1" != "" ]; do
    case $1 in
        -nb | --nobundle )      #shift
                                do_bundle=0
                                ;;
        -na | --noassemble )    do_assemble=0
                                ;;
        -d | --debug )          debug=1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

# Create sourcemaps
if (( $do_bundle == 1 )); then
    echo -e "\033[31mCreating sourcemaps...\033[0m"
    react-native bundle \
        --dev false \
        --platform android \
        --entry-file index.android.js \
        --bundle-output android.main.bundle \
        --sourcemap-output android.main.bundle.map
else
    echo -e "\033[31mSkipping sourcemap creation\033[0m"
fi

# Create the APK
if (( $do_assemble == 1 && $debug == 0 )); then
    echo -e "\033[31mAssemblign APK...\033[0m"
    cd android && ./gradlew assembleRelease && cd ..
else
    echo -e "\033[31mSkipping APK assembly\033[0m"
fi

# Install APK and push the sourcemaps to the device
if (( $debug == 0 )); then
    echo -e "\033[31mInstalling APK...\033[0m"
    adb install -r android/app/build/outputs/apk/app-release.apk
else
    echo -e "\033[31mRunning react-native...\033[0m"
    react-native run-android
fi
echo -e "\033[31mPushing sourcemaps to device SD card\033[0m"
adb push android.main.bundle.map /sdcard/

# Write deployment file
echo -e "\033[31mWriting deployment file...\033[0m"
echo -e "\033[31mCommit: $commit\033[0m"
echo "{\"commit\": \"$commit\"}" > deployment.txt
adb push deployment.txt /sdcard/
rm deployment.txt

# Remove old crashlogs
adb shell rm /sdcard/crashlog.txt
