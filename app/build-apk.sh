#!/bin/bash
# 一键打安卓 APK：构建 app-plus 资源 → 拷入离线 SDK 工程 → gradle 编译
# 输出：/home/be/000beuniapp/output/在线教育-debug.apk
set -e

PROJ=/home/be/000beuniapp/codemaster/coder
SDK=/home/be/000beuniapp/soft/3.99/extracted/Android-SDK@3.99.81993_20231227
AS="$SDK/HBuilder-Integrate-AS"
APPID=__UNI__B061A11
M="$AS/simpleDemo/src/main"

export JAVA_HOME=/home/be/jdk11/jdk-11.0.31+11
export ANDROID_HOME=/home/be/android-sdk
export ANDROID_SDK_ROOT=/home/be/android-sdk
export PATH=$JAVA_HOME/bin:$PATH

echo "==> [1/3] 构建 app-plus 资源"
cd "$PROJ"
rm -rf dist/app-plus
npm run build:app-plus

echo "==> [2/3] 拷贝资源到离线 SDK 工程"
rm -rf "$M/assets/apps/$APPID/www"
mkdir -p "$M/assets/apps/$APPID/www"
cp -r "$PROJ/dist/app-plus/"* "$M/assets/apps/$APPID/www/"

echo "==> [3/3] gradle 编译 APK"
cd "$AS"
./gradlew :simpleDemo:assembleDebug --no-daemon

echo ""
echo "✅ 完成：/home/be/000beuniapp/output/在线教育-debug.apk"
