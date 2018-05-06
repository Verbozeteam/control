package com.verbozecontrol;

import com.verbozecontrol.socket.*;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnimmersive.RNImmersivePackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.devstepbcn.wifi.AndroidWifiPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.horcrux.svg.SvgPackage;
import com.ninty.system.setting.SystemSettingPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
            new RNImmersivePackage(),
            new RNSoundPackage(),
            new AndroidWifiPackage(),
            new SplashScreenReactPackage(),
            new SvgPackage(),
                new SystemSettingPackage(),
                new LinearGradientPackage(),
                new SocketPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
    }
}
