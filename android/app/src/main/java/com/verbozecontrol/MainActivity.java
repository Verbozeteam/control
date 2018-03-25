package com.verbozecontrol;

import com.facebook.react.ReactActivity;
import android.view.KeyEvent;
import android.content.Intent;
import android.content.Context;
import android.os.Bundle;
import android.os.Build;
import android.os.PowerManager;
import java.lang.Thread;

public class MainActivity extends ReactActivity {

    private int numVolDownKeyPress = 0;
    private long lastVolDownKeyPressTime = 0;

    protected PowerManager.WakeLock mWakeLock;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
     @Override
    protected String getMainComponentName() {
        return "VerbozeControl";
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // obtain wake lock so screen does not dim or go to sleep
        final PowerManager pm =
            (PowerManager) getSystemService(Context.POWER_SERVICE);

        mWakeLock = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK |
            PowerManager.ACQUIRE_CAUSES_WAKEUP, "VerbozeControl");
        mWakeLock.acquire();

        KillSystemUI();

        final Thread.UncaughtExceptionHandler oldHandler =
            Thread.getDefaultUncaughtExceptionHandler();

        // create new exception handler that reboots the app after crashing
        // FIXME: currently doesn't work
        Thread.setDefaultUncaughtExceptionHandler(
            new Thread.UncaughtExceptionHandler() {
                @Override
                public void uncaughtException(Thread thread,
                    Throwable throwable) {

                    restartApp();
                    if (oldHandler != null) {
                        oldHandler.uncaughtException(thread, throwable);
                    } else {
                        System.exit(2);
                    }
                }
            }
        );
    }

    /**
     * Creates a new Intent that starts the app in a new Activity and releases
     * any other instances of the Activity.
     */
    public void restartApp() {
        Intent mIntent = getBaseContext().getPackageManager()
            .getLaunchIntentForPackage(getBaseContext().getPackageName());

        mIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_CLEAR_TASK |
            Intent.FLAG_ACTIVITY_NEW_TASK);

        startActivity(mIntent);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {

        // open system Settings application if volume down pressed 5 times
        // rapidly
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            long currTime = System.currentTimeMillis();

            if (currTime - lastVolDownKeyPressTime <= 500) {
                numVolDownKeyPress++;
            } else {
                numVolDownKeyPress = 1;
            }

            lastVolDownKeyPressTime = currTime;

            if (numVolDownKeyPress > 4) {
                Intent settingsIntent =
                    new Intent(android.provider.Settings.ACTION_SETTINGS);
                startActivityForResult(settingsIntent, 0);

                numVolDownKeyPress = 0;
                lastVolDownKeyPressTime = 0;
            }
        }
        return true;
    }

    private void KillSystemUI() {
        Process proc = null;
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            String ProcID = "79"; //HONEYCOMB AND OLDER

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH)
                ProcID = "42"; //ICS AND NEWER

            try {
                proc = Runtime.getRuntime().exec(new String[]{"su", "-c", "service call activity " + ProcID + " s16 com.android.systemui"});
            } catch (Exception e) {
                e.printStackTrace();
            }
            try {
                proc.waitFor();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            // EDIT Build.prop file and add qemu.hw.mainkeys=1
        }
    }
}
