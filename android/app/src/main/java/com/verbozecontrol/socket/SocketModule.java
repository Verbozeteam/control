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

public class SocketModule extends ReactContextBaseJavaModule {
    private static final String TAG = "Socket";
    private ReactApplicationContext react_context = null;

    // socket event names
    private static final String socket_connected = "socket_connected";
    private static final String socket_disconnected = "socket_disconnected";
    private static final String socket_data = "socket_data";

    private CommunicationManager comm_mgr = null;

    public SocketModule(ReactApplicationContext react_context) {
        super(react_context);
        this.react_context = react_context;
        comm_mgr = CommunicationManager.Create("communication_manager",
            new CommunicationManager.OnConnectedCallback() {
                @Override
                public void onConnected() {
                    WritableMap params = Arguments.createMap();
                    sendEvent(react_context, socket_connected, params);
                }
            },
            new CommunicationManager.OnDataCallback() {
                @Override
                public void onData(String json) {
                    System.out.println("got data " + json + "\n");
                }
            },
            new CommunicationManager.OnDisconnectedCallback() {
                @Override
                public void onDisconnected() {
                    System.out.println("disconnected...");
                }
            });
    }

    public ~SocketModule() {

    }

    private void sendEvent(ReactContext react_context,
        String event_name, @Nullable WritableMap params) {
            react_context.getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(event_name, params);
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

        return constants;
    }
}
