package com.verbozecontrol.socket;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import java.util.concurrent.locks.ReentrantLock;

import java.nio.charset.StandardCharsets;

public class CommunicationManager implements Runnable {
    public static class OnConnectedCallback {
        public void onConnected() {}
    }

    public static class OnDataCallback {
        public void onData(String json_data) {}
    }

    public static class OnDisconnectedCallback {
        public void onDisconnected() {}
    }

    public static class DeviceDiscoveryCallback {
        public void onDeviceFound(String addr, String text, int type, String data) {}
    }

    private final int BUFFER_SIZE = 256;
    private String[] commandsBuffer;
    private int bufferStart, bufferEnd;
    private String target_IP = "";
    private int target_port = 0;
    private boolean connected = false;
    private boolean is_running = true;
    private ReentrantLock lock = new ReentrantLock();

    private OnConnectedCallback m_connected_callback = null;
    private OnDataCallback m_data_callback = null;
    private OnDisconnectedCallback m_disconnected_callback = null;

    public static CommunicationManager Create (String name,
        OnConnectedCallback ccb,
        OnDataCallback dcb,
        OnDisconnectedCallback dccb) {

        CommunicationManager m = new CommunicationManager();
        m.m_connected_callback = ccb;
        m.m_data_callback = dcb;
        m.m_disconnected_callback = dccb;

        Thread thread = new Thread(m, name);
        thread.start();
        return m;
    }

    public static void DiscoverDevices (final DeviceDiscoveryCallback cb) {
        Thread discoverer = new Thread() {
            @Override
            public void run() {
                DatagramSocket s = null;
                try {
                    s = new DatagramSocket();
                    s.setBroadcast(true);
                    InetAddress address = InetAddress.getByName("255.255.255.255");
                    byte[] sendData = {(byte) 0x29, (byte) 0xad, 0, 0};
                    DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, address, 7991);
                    s.send(sendPacket);

                    s.setSoTimeout(2000);

                    DatagramPacket pack = new DatagramPacket(new byte[128], 128);
                    while (true) {
                        s.receive(pack);
                        final String addr = pack.getAddress().toString().replaceAll("/", "");
                        byte[] bytes = pack.getData();
                        if (bytes[0] == (byte) 0x29 && bytes[1] == (byte) 0xad) {
                            final int type = bytes[2];
                            String not_final_text = "";
                            int len = bytes[3];
                            for (int i = 4; i < 4 + len; i++)
                                not_final_text += (char) bytes[i];
                            int colon_index = not_final_text.indexOf(':');
                            String not_final_data = "";
                            if (colon_index != -1) {
                                not_final_data = not_final_text.substring(colon_index+1);
                                not_final_text = not_final_text.substring(0, colon_index);
                            }
                            final String text = not_final_text; // now me make it final lol
                            final String data = not_final_data;
                            cb.onDeviceFound(addr, text, type, data);
                        }
                    }
                } catch (SocketTimeoutException e) {
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    if (s != null && s.isConnected())
                        s.close();
                }
            }
        };
        discoverer.start();
    }

    private CommunicationManager() {
    }

    public synchronized void addToQueue(String cmd) {
        if (commandsBuffer[(bufferEnd+BUFFER_SIZE-1) % BUFFER_SIZE] == cmd)
            return;
        if ((bufferEnd + 1) % BUFFER_SIZE != bufferStart) {
            commandsBuffer[bufferEnd] = cmd;
            bufferEnd = (bufferEnd+1) % BUFFER_SIZE;
        }
    }

    public synchronized void SetServerAddress(String IP, int port) {
        bufferEnd = bufferStart;
        target_port = port;
        target_IP = IP;
    }

    public void Stop() {
        lock.lock();
        is_running = false;
        lock.unlock();
    }

    @Override
    public void run() {
        commandsBuffer = new String[BUFFER_SIZE];
        for (int i = 0; i < BUFFER_SIZE; i++)
            commandsBuffer[i] = null;
        bufferEnd = bufferStart = 0;
        Socket socket = null;
        OutputStream output = null;
        InputStream input = null;
        String IP = target_IP;
        int port = target_port;
        long beat_timer = 0;
        ArrayList<Byte> buffer = new ArrayList<>();

        while (true) {
            // check if we're done
            lock.lock();
            if (!is_running) {
                lock.unlock();
                try {
                    if (socket != null)
                        socket.close();
                } catch (Exception e) {}
                break;
            }
            lock.unlock();

            long curTime = System.currentTimeMillis();
            if (IP != target_IP) {
                try {
                    if (socket != null) {
                        socket.close();
                        try {
                            m_disconnected_callback.onDisconnected();
                        } catch (Exception e) {}
                    }
                } catch (Exception e) {}
                socket = null;
                connected = false;
                IP = target_IP;
                port = target_port;
            }

            if (IP == "")
                continue;

            if (!connected) {
                try {
                    InetAddress addr = InetAddress.getByName(IP);
                    socket = new Socket(addr, port);
                    output = socket.getOutputStream();
                    input = socket.getInputStream();
                    connected = true;
                    buffer.clear();
                    try {
                        m_connected_callback.onConnected();
                    } catch (Exception e) {}
                } catch (Exception e) {
                    try {
                        Thread.sleep(1000);
                    } catch(InterruptedException e2) {}
                    continue;
                }
            }

            // we are connected, do connected stuff
            try {
                int num_available = input.available();
                if (num_available > 0) {
                    byte[] read_bytes = new byte[num_available];
                    int num_read = input.read(read_bytes);
                    for (int i = 0; i < num_read; i++)
                        buffer.add(read_bytes[i]);
                }
            } catch (IOException e) {
                connected = false;
            }
            ProcessBuffer(buffer);

            // send an empty message just to check if the connection is dead
            if (curTime - beat_timer > 3000) {
                beat_timer = curTime;
                try {
                    output.write(2);
                    output.write(0);
                    output.write(0);
                    output.write(0);
                    output.write("{}".getBytes());
                } catch (Exception e) {
                    connected = false;
                }
            }

            int bufend = bufferEnd;
            while (bufend != bufferStart) {
                String cmd = commandsBuffer[bufferStart];
                commandsBuffer[bufferStart] = null;
                bufferStart = (bufferStart + 1) % BUFFER_SIZE;
                try {
                    byte[] cmdBytes = new byte[4 + cmd.length()];

                    cmdBytes[0] = (byte)((cmd.length() & 0xFF));
                    cmdBytes[1] = (byte)((cmd.length() << 8) & 0xFF);
                    cmdBytes[2] = (byte)((cmd.length() << 16) & 0xFF);
                    cmdBytes[3] = (byte)((cmd.length() << 24) & 0xFF);

                    System.arraycopy(cmd.getBytes(), 0, cmdBytes, 4, cmd.length());
                    output.write(cmdBytes);
                } catch (IOException e) {
                    connected = false;
                }
            }

            try {
                output.flush();
            } catch (Exception e) {}

            synchronized (this) {
                try {
                    wait(10);
                } catch (InterruptedException e) {}
            }

            // bookkeeping
            if (socket == null)
                connected = false;
            else if (socket.isConnected() == false)
                connected = false;

            if (!connected) {
                try {
                    if (socket != null) {
                        socket.close();
                        try {
                            m_disconnected_callback.onDisconnected();
                        } catch (Exception e) {}
                    }
                } catch (Exception e) {}
            }
        }
    }

    private void ProcessBuffer(ArrayList<Byte> buffer) {
        while (buffer.size() >= 4) {
            int payload_size =
                ((((int)buffer.get(0)) & 0xFF)      ) |
                ((((int)buffer.get(1)) & 0xFF) << 8 ) |
                ((((int)buffer.get(2)) & 0xFF) << 16) |
                ((((int)buffer.get(3)) & 0xFF) << 24);

            if (buffer.size() >= 4 + payload_size) {
                List<Byte> payload = buffer.subList(4, 4 + payload_size);

                byte[] byte_array = new byte[payload.size()];
                for (int i = 0; i < payload.size(); i++)
                    byte_array[i] = payload.get(i);
                String payload_string = new String(byte_array, StandardCharsets.UTF_8);

                for (int i = 0; i < 4 + payload_size; i++)
                    buffer.remove(0);

                try {
                    m_data_callback.onData(payload_string);
                } catch (Exception e) {}
            } else
                break;
        }
    }
}
