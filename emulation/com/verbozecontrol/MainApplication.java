package com.verbozecontrol;

import com.verbozecontrol.socket.*;

import java.util.Arrays;
import java.util.List;

import org.json.simple.JSONObject;

public class MainApplication {
    private static CommunicationManager communication_manager = null;

    public static void main(String[] args) {
        communication_manager = CommunicationManager.Create("communication",
            new CommunicationManager.OnConnectedCallback() {
                @Override
                public void onConnected() {
                    System.out.println("connected!");
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

        JSONObject obj = new JSONObject();
        obj.put("code", 0);

        communication_manager.SetServerAddress("192.168.1.11", 4567);
        communication_manager.addToQueue(obj.toString());

        System.out.println("Hello, World!");
        System.out.println(obj.toString());
    }
}

