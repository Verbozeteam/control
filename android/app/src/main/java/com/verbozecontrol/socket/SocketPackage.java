package com.verbozecontrol.socket;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SocketPackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext
        react_context) {

        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext
        react_context) {

        List<NativeModule> modules = new ArrayList<>();

        modules.add(new SocketModule(react_context));

        return modules;
    }
}
