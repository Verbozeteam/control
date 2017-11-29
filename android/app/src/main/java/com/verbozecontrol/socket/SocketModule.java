package com.verbozecontrol.socket;

import com.verbozecontrol.socket.CommunicationManager;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import android.support.annotation.Nullable;

import java.util.Map;
import java.util.HashMap;

public class SocketModule extends ReactContextBaseJavaModule {

    private static final String TAG = "Socket";
    private ReactContext mReactContext = null;

    // socket event names
    private static final String socket_connected = "socket_connected";
    private static final String socket_disconnected = "socket_disconnected";
    private static final String socket_data = "socket_data";
    private static final String device_discovered = "device_discovered";

    private CommunicationManager comm_mgr = null;

    public SocketModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;

        comm_mgr = CommunicationManager.Create("communication_manager",
            new CommunicationManager.OnConnectedCallback() {
                @Override
                public void onConnected() {
                    WritableMap params = Arguments.createMap();
                    sendEvent(mReactContext, socket_connected, params);
                }
            },

            new CommunicationManager.OnDataCallback() {
                @Override
                public void onData(String json) {
                    WritableMap params = Arguments.createMap();
                    params.putString("data", json);
                    sendEvent(mReactContext, socket_data, params);
                }
            },

            new CommunicationManager.OnDisconnectedCallback() {
                @Override
                public void onDisconnected() {
                    WritableMap params = Arguments.createMap();
                    sendEvent(mReactContext, socket_disconnected, params);
                }
            }
        );
    }

    private void sendEvent(ReactContext reactContext,
        String eventName, @Nullable WritableMap params) {

        reactContext.getJSModule(
            DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    @ReactMethod
    public void connect(String address, Integer port) {
        comm_mgr.SetServerAddress(address, port);
    }

    @ReactMethod
    public void write(String payload) {
        comm_mgr.addToQueue(payload);
    }

    @ReactMethod
    public void disconnect() {
        comm_mgr.SetServerAddress("", 0);
    }

    @ReactMethod
    public void killThread() {
        comm_mgr.Stop();
    }

    @ReactMethod
    public void discoverDevices() {
        comm_mgr.DiscoverDevices(new CommunicationManager.DeviceDiscoveryCallback() {
            @Override
            public void onDeviceFound(String addr, String text, int type, String data) {
                WritableMap params = Arguments.createMap();
                params.putString("ip", addr);
                params.putString("name", text);
                params.putInt("type", type);
                params.putString("data", data);
                sendEvent(mReactContext, device_discovered, params);
            }
        });
    }

    @Override
    public String getName() {
        return TAG;
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(socket_connected, socket_connected);
        constants.put(socket_disconnected, socket_disconnected);
        constants.put(socket_data, socket_data);
        constants.put(device_discovered, device_discovered);

        return constants;
    }
}
