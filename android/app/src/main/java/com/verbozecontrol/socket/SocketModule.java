package com.verbozecontrol.socket;

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
import java.util.ArrayList;
import java.util.List;

import java.net.Socket;
import java.net.UnknownHostException;
import java.net.SocketTimeoutException;

import java.io.OutputStream;
import java.io.InputStream;
import java.io.IOException;

import java.nio.charset.StandardCharsets;;

public class SocketModule extends ReactContextBaseJavaModule {
    private static final String TAG = "Socket";
    private ReactApplicationContext react_context = null;

    private Socket socket = null;
    private boolean connected = false;

    // socket event names
    private static final String socket_connected = "socket_connected";
    private static final String socket_disconnected = "socket_disconnected";
    private static final String socket_error = "socket_error";
    private static final String socket_data = "socket_data";

    public SocketModule(ReactApplicationContext react_context) {
        super(react_context);
        this.react_context = react_context;
    }

    private void sendEvent(ReactContext react_context,
        String event_name, @Nullable WritableMap params) {
            react_context.getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(event_name, params);
    }

    @ReactMethod
    public void connect(String address, Integer port) {
        try {
            socket = new Socket(address, port);
            connected = true;

            WritableMap params = Arguments.createMap();
            sendEvent(react_context, socket_connected, params);

            listen();
        }

        catch (UnknownHostException e) {

        }

        catch (IOException e) {

        }
    }

    @ReactMethod
    public void write(String payload) {
        try {
            byte[] size = new byte[4];

            size[0] = (byte)((payload.length() & 0xFF));
            size[1] = (byte)((payload.length() << 8) & 0xFF);
            size[2] = (byte)((payload.length() << 16) & 0xFF);
            size[3] = (byte)((payload.length() << 24) & 0xFF);

            OutputStream output_stream = socket.getOutputStream();
            output_stream.write(size);
            output_stream.write(payload.getBytes());
        }

        catch (IOException e) {

        }
    }

    @ReactMethod
    private void listen() {
        try {
            ArrayList<Byte> data = new ArrayList<>();
            InputStream input_stream = socket.getInputStream();

            while (connected) {
                int incoming = input_stream.read();

                if (incoming == -1) {
                    disconnect();

                    WritableMap params = Arguments.createMap();
                    sendEvent(react_context, socket_disconnected, params);
                }
                else {
                    data.add((byte)incoming);

                    if (data.size() >= 4) {
                        int payload_size = (data.get(0) & 0xFF) +
                            ((data.get(1) >> 8) & 0xFF) +
                            ((data.get(2) >> 16) & 0xFF) +
                            ((data.get(3) >> 24) & 0xFF);

                        if (data.size() >= 4 + payload_size) {
                            List<Byte> payload = data.subList(4,
                                4 + payload_size);
                            data = new ArrayList<Byte>(data.subList(4 + payload_size, data.size()));

                            byte[] byte_array = new byte[payload.size()];
                            for (int i = 0; i < payload.size(); i++)
                                byte_array[i] = payload.get(i);
                            String payload_string = new String(byte_array, StandardCharsets.UTF_8);

                            WritableMap params = Arguments.createMap();
                            params.putString("payload", payload_string);
                            sendEvent(react_context, socket_data, params);
                        }
                    }
                }
            }
        }

        catch (IOException e) {

        }
    }

    // private void watchIncoming() {
        // try {
            // ArrayList<Byte> data = new ArrayList<>();
            // InputStream inputStream = clientSocket.getInputStream();
    //         while (isOpen) {
    //             int incomingByte = inputStream.read();
    //
    //             if (incomingByte == -1) {
    //                 //debug log
    //                 Log.v(eTag, "Client disconnected");
    //                 isOpen = false;
    //                 //emit event
    //                 WritableMap eventParams = Arguments.createMap();
    //                 sendEvent(mReactContext, event_closed, eventParams);
    //             } else {
    //                 data.add(incomingByte);
    //                 if (data.size() >= 4) {
    //                     int msgLen = (data[0] & 0xFF) + ((data[1] >> 8) & 0xFF) + ((data[2] >> 16) & 0xFF) + ((data[3] >> 24) & 0xFF);
    //                     if (data.size() >= 4 + msgLen) {
    //                         List<Byte> msg = data.subList(4, 4+msgLen);
    //                         data.removeRange(0, 4+msgLen);
    //                         String strMsg = new String(Bytes.toArray(msg), StandardCharsets.UTF_8);
    //
    //                         //debug log
    //                         Log.d(eTag, "client received message: " + strMsg);
    //                         //emit event
    //                         WritableMap eventParams = Arguments.createMap();
    //                         eventParams.putString("data", strMsg);
    //                         sendEvent(mReactContext, event_data, eventParams);
    //                     }
    //                 }
    //             }
    //         }
        // } catch (IOException e) {
            // handleIOException(e);
        // }
    // }

    @ReactMethod
    public void disconnect() {
        try {
            if (socket != null) {
                socket.close();
                socket = null;
                connected = false;
            }
        }

        catch (IOException e) {

        }
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
        constants.put(socket_error, socket_error);
        constants.put(socket_data, socket_data);

        return constants;
    }
}
