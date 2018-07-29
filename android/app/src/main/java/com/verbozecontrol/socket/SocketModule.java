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

    private ReactContext mReactContext = null;

    // socket event names
    protected String m_socket_connected = "socket_connected";
    protected String m_socket_disconnected = "socket_disconnected";
    protected String m_socket_data = "socket_data";
    protected String m_device_discovered = "device_discovered";
    protected String m_log_sent = "log_sent";

    private CommunicationManager comm_mgr = null;

    public SocketModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public void finalize() {
        killThread();
    }

    @ReactMethod
    public void initialize() {
        final String socket_connected = m_socket_connected;
        final String socket_disconnected = m_socket_disconnected;
        final String socket_data = m_socket_data;
        final String log_sent = m_log_sent;

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
            },

            new CommunicationManager.OnLogSentCallback() {
                @Override
                public void onLogSent(String log) {
                    WritableMap params = Arguments.createMap();
                    params.putString("log", log);
                    sendEvent(mReactContext, log_sent, params);
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
    public void setSSLKey(String key, String cert, String password) {
        if (comm_mgr != null)
            comm_mgr.SetSSLKey(key, cert, password);
    }

    @ReactMethod
    public void connect(String address, Integer port, Boolean is_ssl) {
        if (comm_mgr != null)
            comm_mgr.SetServerAddress(address, port, is_ssl);
    }

    @ReactMethod
    public void startConnecting() {
        if (comm_mgr != null)
            comm_mgr.StartConnecting();
    }

    @ReactMethod
    public void stopConnecting() {
        if (comm_mgr != null)
            comm_mgr.StopConnecting();
    }

    @ReactMethod
    public void write(String payload) {
        if (comm_mgr != null)
            comm_mgr.addToQueue(payload);
    }

    @ReactMethod
    public void disconnect() {
        if (comm_mgr != null)
            comm_mgr.SetServerAddress("", 0, false);
    }

    @ReactMethod
    public void killThread() {
        if (comm_mgr != null) {
            comm_mgr.Stop();
            comm_mgr = null;
        }
    }

    @ReactMethod
    public void discoverDevices() {
        if (comm_mgr != null) {
            final String device_discovered = m_device_discovered;
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
    }

    @Override
    public String getName() {
        return "MainSocket";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(m_socket_connected, m_socket_connected);
        constants.put(m_socket_disconnected, m_socket_disconnected);
        constants.put(m_socket_data, m_socket_data);
        constants.put(m_device_discovered, m_device_discovered);
        constants.put(m_log_sent, m_log_sent);

        return constants;
    }

    public static class SecondarySocketModule extends SocketModule {
        public SecondarySocketModule(ReactApplicationContext reactContext) {
            super(reactContext);
            m_socket_connected = "secondary_socket_connected";
            m_socket_disconnected = "secondary_socket_disconnected";
            m_socket_data = "secondary_socket_data";
            m_device_discovered = "secondary_device_discovered";
            m_log_sent = "secondary_log_sent";
        }

        @ReactMethod
        public void initialize() {
            super.initialize();
        }

        @ReactMethod
        public void setSSLKey(String key, String cert, String password) {
            super.setSSLKey(key, cert, password);
        }

        @ReactMethod
        public void connect(String address, Integer port, Boolean use_ssl) {
            super.connect(address, port, use_ssl);
        }

        @ReactMethod
        public void startConnecting() {
            super.startConnecting();
        }

        @ReactMethod
        public void stopConnecting() {
            super.stopConnecting();
        }

        @ReactMethod
        public void write(String payload) {
            super.write(payload);
        }

        @ReactMethod
        public void disconnect() {
            super.disconnect();
        }

        @ReactMethod
        public void killThread() {
            super.killThread();
        }

        @ReactMethod
        public void discoverDevices() {
            super.discoverDevices();
        }

        @Override
        public String getName() {
            return "SecondarySocket";
        }
    };
}
