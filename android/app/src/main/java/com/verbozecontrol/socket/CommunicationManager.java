package com.verbozecontrol.socket;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;

import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.security.cert.CertificateFactory;

import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

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
    public static class OnLogSentCallback {
        public void onLogSent(String log) {}
    }

    private final int BUFFER_SIZE = 256;
    private String name = "";
    private String[] commandsBuffer;
    private int bufferStart, bufferEnd;
    private String target_IP = "";
    private int target_port = 0;
    private boolean use_ssl = false;
    private SSLContext sslContext = null;
    private SSLSocketFactory sslSocketFactory = null;
    private boolean is_running = true;
    private boolean is_socket_dead = false;
    private boolean auto_connect = true;

    private OnConnectedCallback m_connected_callback = null;
    private OnDataCallback m_data_callback = null;
    private OnDisconnectedCallback m_disconnected_callback = null;
    private OnLogSentCallback m_log_sent_callback = null;

    private static HashMap<String, CommunicationManager> m_communication_managers = new HashMap<String, CommunicationManager>();

    public static CommunicationManager Create (String name,
                                               OnConnectedCallback ccb,
                                               OnDataCallback dcb,
                                               OnDisconnectedCallback dccb,
                                               OnLogSentCallback lscb) {

        if (m_communication_managers.containsKey(name)) {
            CommunicationManager old_manager = m_communication_managers.get(name);
            old_manager.Stop();
            m_communication_managers.remove(name);
        }

        CommunicationManager m = new CommunicationManager(name);
        m.m_connected_callback = ccb;
        m.m_data_callback = dcb;
        m.m_disconnected_callback = dccb;
        m.m_log_sent_callback = lscb;

        m_communication_managers.put(name, m);

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
                } finally {
                    if (s != null && s.isConnected())
                        s.close();
                }
            }
        };
        discoverer.start();
    }

    private CommunicationManager(String n) {
        name = n;
    }

    public synchronized void addToQueue(String cmd) {
        if (commandsBuffer[(bufferEnd+BUFFER_SIZE-1) % BUFFER_SIZE] == cmd)
            return;
        if ((bufferEnd + 1) % BUFFER_SIZE != bufferStart) {
            commandsBuffer[bufferEnd] = cmd;
            bufferEnd = (bufferEnd+1) % BUFFER_SIZE;
        }
        notify();
    }

    public synchronized void SetSSLKey(String key, String certificate, String password) {
        try {
            KeyManager[] keyManagers = new KeyManager[] { null };
            TrustManager[] trustManagers = new TrustManager[] { null };

            // load truststore certificate
            try {
                if (certificate != null) {
                    CertificateFactory cf = CertificateFactory.getInstance("X.509");
                    KeyStore trustStore = KeyStore.getInstance("AndroidKeyStore");
                    trustStore.load(null);

                    X509Certificate cacert = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(certificate.getBytes()));
                    trustStore.setCertificateEntry("server_alias", cacert);

                    TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
                    trustManagerFactory.init(trustStore);
                    trustManagers = trustManagerFactory.getTrustManagers();
                }
            } catch (Exception e) {
                trustManagers = new TrustManager[] { new X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }

                    public void checkClientTrusted(X509Certificate[] certs, String authType) {
                    }

                    public void checkServerTrusted(X509Certificate[] certs, String authType) {
                    }
                } };
            }

            // load client certificate
            try {
                if (key != null) {
                    KeyStore keyStore = KeyStore.getInstance("BKS");
                    keyStore.load(new ByteArrayInputStream(key.getBytes()), password.toCharArray());
                    KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
                    keyManagerFactory.init(keyStore, password.toCharArray());
                    keyManagers = keyManagerFactory.getKeyManagers();
                }
            } catch (Exception e) {}

            // create ssl context
            sslContext = SSLContext.getInstance("TLSv1.2");
            sslContext.init(keyManagers, trustManagers, null);
            sslSocketFactory = sslContext.getSocketFactory();
        } catch (Exception e) {}
    }

    public synchronized void SetServerAddress(String IP, int port, boolean ssl) {
        bufferEnd = bufferStart;
        target_port = port;
        use_ssl = ssl && sslSocketFactory != null;
        target_IP = IP;
        auto_connect = true;
        notify();
    }

    public synchronized void Stop() {
        is_running = false;
        notify();
    }

    public synchronized void StartConnecting() {
        auto_connect = true;
        notify();
    }

    public synchronized void StopConnecting() {
        auto_connect = false;
        MarkSocketDead(true);
    }

    public synchronized void MarkSocketDead(boolean is_dead) {
        is_socket_dead = is_dead;
        notify();
    }

    @Override
    public void run() {
        commandsBuffer = new String[BUFFER_SIZE];
        for (int i = 0; i < BUFFER_SIZE; i++)
            commandsBuffer[i] = null;
        bufferEnd = bufferStart = 0;
        boolean connected = false;
        Socket socket = null;
        OutputStream output = null;
        InputStream input = null;
        String IP = target_IP;
        int port = target_port;
        boolean ssl = use_ssl;
        boolean reconnect = auto_connect;
        long beat_timer = 0;

        // m_log_sent_callback.onLogSent("Starting main communication thread");
        CommunicationReader reader = new CommunicationReader(this);
        Thread thread = new Thread(reader, name+"-reader");
        thread.start();

        while (true) {
            long curTime = System.currentTimeMillis();

            synchronized(this) {
                // check if we're done
                if (!is_running) {
                    reader.SetStream(null);
                    disconnectSocket(socket, input, output);
                    socket = null;
                    break;
                }

                // Check if new connection is requested
                if (IP != target_IP || port != target_port || ssl != use_ssl) {
                    reader.SetStream(null);
                    disconnectSocket(socket, input, output);
                    socket = null;

                    socket = null;
                    connected = false;
                    ssl = use_ssl;
                    IP = target_IP;
                    port = target_port;
                }

                reconnect = auto_connect;

                if (is_socket_dead) {
                    MarkSocketDead(false);
                    reader.SetStream(null);
                    disconnectSocket(socket, input, output);
                    socket = null;
                    connected = false;
                }
            }

            if (IP == "")
                continue;

            if (!connected && reconnect) {
                try {
                    // m_log_sent_callback.onLogSent("Attempting to connect...");
                    InetAddress addr = InetAddress.getByName(IP);
                    if (!ssl) {
                        socket = new Socket(addr, port);
                    } else {
                        socket = (SSLSocket) sslSocketFactory.createSocket();
                        SSLSocket sslsock = (SSLSocket)socket;
                        sslsock.setEnabledProtocols(new String[] {"TLSv1.2"});
                        sslsock.setUseClientMode(true);
                        sslsock.setEnabledCipherSuites(new String[] {
                            "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256",
                            "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256",
                            "TLS_RSA_WITH_AES_128_CBC_SHA256",
                        });
                        sslsock.connect(new InetSocketAddress(addr, port));
                        sslsock.startHandshake();
                    }
                    output = socket.getOutputStream();
                    input = socket.getInputStream();
                    reader.SetStream(input);
                    connected = true;
                    beat_timer = curTime;
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

            // send an empty message just to check if the connection is dead
            if (curTime - beat_timer > 3000) {
                beat_timer = curTime;
                if (!SendCommand(output, "{}"))
                    connected = false;
            }

            int bufend = bufferEnd;
            while (bufend != bufferStart) {
                String cmd = commandsBuffer[bufferStart];
                commandsBuffer[bufferStart] = null;
                bufferStart = (bufferStart + 1) % BUFFER_SIZE;
                if (!SendCommand(output, cmd))
                    connected = false;
            }

            try {
                output.flush();
            } catch (Exception e) {}

            synchronized (this) {
                try {
                    wait(1000);
                } catch (InterruptedException e) {}
            }

            // bookkeeping
            if (socket == null)
                connected = false;
            else if (socket.isConnected() == false)
                connected = false;

            if (!connected && socket != null) {
                reader.SetStream(null);
                disconnectSocket(socket, input, output);
                socket = null;
            }
        }

        reader.Stop();
    }

    private boolean SendCommand(OutputStream output, String cmd) {
        try {
            byte[] cmdBytes = new byte[4 + cmd.length()];

            cmdBytes[0] = (byte)((cmd.length() & 0xFF));
            cmdBytes[1] = (byte)((cmd.length() << 8) & 0xFF);
            cmdBytes[2] = (byte)((cmd.length() << 16) & 0xFF);
            cmdBytes[3] = (byte)((cmd.length() << 24) & 0xFF);

            System.arraycopy(cmd.getBytes(), 0, cmdBytes, 4, cmd.length());
            output.write(cmdBytes);
        } catch (Exception e) {
            return false;
        }

        return true;
    }

    private void disconnectSocket(Socket socket, InputStream input, OutputStream output) {
        try {
            if (socket != null) {
                try { input.close(); } catch (Exception e) {}
                try { output.close(); } catch (Exception e) {}
                try { socket.close(); } catch (Exception e) {}
                try {
                    m_disconnected_callback.onDisconnected();
                } catch (Exception e) {}
            }
        } catch (Exception e) {}
    }

    private static class CommunicationReader implements Runnable {
        private CommunicationManager manager;
        private InputStream input_stream = null;
        private boolean is_running = true;

        public CommunicationReader(CommunicationManager mgr) {
            manager = mgr;
        }

        public synchronized void SetStream(InputStream s) {
            input_stream = s;
        }

        public synchronized void Stop() {
            is_running = false;
        }

        @Override
        public void run() {
            // long id = Thread.currentThread().getId();
            // String tid = "[" + Long.toString(id) + "] ";
            byte[] tmp = new byte[1024];
            ArrayList<Byte> buffer = new ArrayList<>();
            InputStream input = null;

            while (is_running) {
                // manager.m_log_sent_callback.onLogSent(tid + "Read loop spin...");
                synchronized(this) {
                    if (input_stream != input) {
                        input = input_stream;
                        buffer.clear();
                        // manager.m_log_sent_callback.onLogSent(tid + "New input: " + input.toString());
                    }
                }

                if (input != null) {
                    try {
                        // manager.m_log_sent_callback.onLogSent(tid + "Attempting to read...");
                        int nread = input.read(tmp, 0, 1024);
                        // manager.m_log_sent_callback.onLogSent(tid + "read " + Integer.toString(nread));
                        if (nread < 0) {
                            throw new Exception();
                        } else {
                            for (int i = 0; i < nread; i++)
                                buffer.add(tmp[i]);

                            ProcessBuffer(buffer);
                        }
                    } catch (Exception e) {
                        SetStream(null);
                        manager.MarkSocketDead(true);
                    }
                } else {
                    synchronized (this) {
                        try {
                            wait(2000);
                        } catch (InterruptedException e) {}
                    }
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
                    String payload_string = new String(byte_array);

                    for (int i = 0; i < 4 + payload_size; i++)
                        buffer.remove(0);

                    try {
                        manager.m_data_callback.onData(payload_string);
                    } catch (Exception e) {}
                } else
                    break;
            }
        }
    }
}