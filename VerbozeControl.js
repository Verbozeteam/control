import { Sentry } from 'react-native-sentry';
import StackTrace from 'stacktrace-js';
const RNFS = require('react-native-fs');

import {
    setJSExceptionHandler,
    getJSExceptionHandler,
    setNativeExceptionHandler
} from 'react-native-exception-handler';

/* setup Sentry error logging */
if (!__DEV__) {
    console.log = () => {};

    // Sentry.config('https://1b88fca87987415a81711bbb4d172dbc:9b46304b295243eca4c6c4d29c9c007f@sentry.verboze.com/3').install();

    // Sentry.setShouldSendCallback((event) => {
    //     const path = RNFS.ExternalStorageDirectoryPath + '/crashlog.txt';
    //         RNFS.appendFile(path, "==--~~==" + JSON.stringify({
    //         crash: event}, null, 4) + "==~~--==", 'utf8');

    //     return true;
    // });

    const currentHandler = getJSExceptionHandler();
    setJSExceptionHandler((error, isFatal) => {
        try {
            var frames = error.stack.split('\n').filter(L => L.match(/.*:.*:*./g)).map(f => {return {
                function: f.split(':')[0],
                line: f.split(':')[1],
                column: f.split(':')[2]
            }});
            if (frames.length > 10)
                frames = frames.slice(frames.length - 10);
            const path = RNFS.ExternalStorageDirectoryPath + '/crashlog.txt';
                RNFS.appendFile(path, "==--~~==" + JSON.stringify({
                    stack: frames,
                    message: error.message,
                    ...error,
                }, null, 4) + "==~~--==", 'utf8');
        } catch(E) {console.log(E)}
        if (currentHandler)
            currentHandler(error, isFatal);
    });

    setNativeExceptionHandler((exceptionString) => {
        const path = RNFS.ExternalStorageDirectoryPath + '/crashlog.txt';
            RNFS.appendFile(path, "==--~~==" + JSON.stringify({
            str: exceptionString}, null, 4) + "==~~--==", 'utf8');
    });
}

import * as React from 'react';
import { StyleSheet, View, Text, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { ConfigManager } from './js-api-utils/ConfigManager';
import Immersive from 'react-native-immersive';
import DeviceEngine from './DeviceEngine';

import SplashScreen from 'react-native-splash-screen';

const I18n = require('./js-api-utils/i18n/i18n');
import SystemSetting from 'react-native-system-setting';
import AuthPasswordPage from './components/AuthPasswordPage';
import { SocketCommunication } from './js-api-utils/SocketCommunication';
const UserPreferences = require('./js-api-utils/UserPreferences');
import SleepView from './components/SleepView';
import AlarmsHelper from './components/Alarms/AlarmsHelper';
import PagingView from './components/PagingView';
const ConnectionStatus = require('./components/ConnectionStatus');

const connectionActions = require ('./redux-objects/actions/connection');
const settingsActions = require ('./redux-objects/actions/settings');
const screenActions = require ('./redux-objects/actions/screen');

import type { SocketDataType, DiscoveredDeviceType } from './js-api-utils/ConnectionTypes';

function mapStateToProps(state) {
    return {
        connectionStatus: state.connection.isConnected,
        language: state.settings.language,
        usingSSL: state.connection.usingSSL
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setConnectionStatus: b => {dispatch(connectionActions.set_connection_status(b));},
        addDiscoveredDevice: d => {dispatch(connectionActions.add_discovered_device(d));},
        setCurrentDevice: d => {dispatch(connectionActions.set_current_device(d));},
        setConfig: c => {dispatch(connectionActions.set_config(c));},
        setThingsStates: thing_to_state => {dispatch(connectionActions.set_things_states(thing_to_state));},
        setLanguage: l => {dispatch(settingsActions.set_language(l));},
        setScreenDimmingState: is_dim => {dispatch(screenActions.dim_screen(is_dim));},
        setDisplayParams: p => {dispatch(screenActions.set_display_params(p));},
        setUsingSSL: b => {dispatch(connectionActions.set_using_ssl(b));}
    };
}

type StateType = {
    screenDimmed: boolean,
    alarmThingId: string,
    authPasswordPage: boolean,
};

class VerbozeControl extends React.Component<{}, StateType> {
    _unsubscribe: () => any = () => null;
    _unsubscribe_config_change: () => any = () => null;
    _unsubscribe_hotel_change: () => any = () => null;

    state = {
        screenDimmed: false,
        alarmThingId: "",
        authPasswordPage: false,
    };

    _screen_dim_timeout: number;
    _screen_dim_timeout_duration: number = __DEV__ ? 30000 : 30000;
    _last_touch_time: number = 0;

    _discovery_timeout: any = undefined;

    componentWillMount() {
        /** Connect to the socket communication library */
        console.log("Initializing sockets...");
        DeviceEngine.initialize();
        SocketCommunication.initialize();
        //SocketCommunication.setSSLKey(null, null, "");
        SocketCommunication.setOnConnected(this.handleSocketConnected.bind(this));
        SocketCommunication.setOnDisconnected(this.handleSocketDisconnected.bind(this));
        SocketCommunication.setOnDeviceDiscovered(this.handleDeviceDiscovered.bind(this));
        SocketCommunication.setOnRequireAuthentication(this.onAuthenticationRequired.bind(this));
        ConfigManager.initialize(SocketCommunication); // this registers SocketCommunication.setOnMessage

        this._unsubscribe = this.context.store.subscribe(this.onReduxStateChanged.bind(this));
        this.onReduxStateChanged();

        /* Detect when config changes to find alarms thing id */
        this._unsubscribe_config_change = ConfigManager.registerConfigChangeCallback(this.onConfigChanged.bind(this));
        if (ConfigManager.config)
            this.onConfigChanged(ConfigManager.config);

        /** Load user preferences */
        UserPreferences.load((() => {
            console.log("preferences loaded");

            ToastAndroid.show('Loaded user preferences', ToastAndroid.SHORT);

            /** Load saved language */
            var lang = UserPreferences.get('language');
            if (lang) {
                console.log('Language loaded from preferences:', lang);
                this.props.setLanguage(lang);
                I18n.setLanguage(lang);
            }

            /** Load authentication token */
            SocketCommunication.setAuthenticationToken(UserPreferences.get('authentication-token'));
            console.log('Authentication token loaded: ' + UserPreferences.get('authentication-token'));

            /** Load device and start discovery */
            var cur_device = UserPreferences.get('device');
            if (cur_device) {
                console.log('Device loaded from preferences:', cur_device);
                this.props.setCurrentDevice(cur_device);
            }
        }).bind(this));

        /** Set volume to max */
        SystemSetting.getVolume().then((volume) => {
            if (volume < 1) {
                SystemSetting.setVolume(1);
            }
        });

        /** Max brightness */
        SystemSetting.setBrightnessForce(1);

        /** Initialize dimming procedures */
        this._resetScreenDim();

        /** Periodic discovery */
        SocketCommunication.discoverDevices();
        this._discovery_timeout = setInterval(() => {
            SocketCommunication.discoverDevices();
        }, 60000);

        Immersive.on();
        Immersive.setImmersive(true);
    }

    componentDidMount() {
        SplashScreen.hide();
    }

    componentWillUnmount() {
        this._unsubscribe();
        this._unsubscribe_config_change();
        this._unsubscribe_hotel_change();
        SocketCommunication.cleanup();
        clearTimeout(this._discovery_timeout);
    }

    onReduxStateChanged() {
        // on every state change, check if we need to connect to socket
        const reduxState = this.context.store.getState();
        if (reduxState && reduxState.connection.currentDevice) {
            if (reduxState.connection.currentDevice.type && reduxState.connection.currentDevice.type == 8) // uses SSL
                SocketCommunication.setSSLKey(null, null, '');
            else
                SocketCommunication.disableSSL();
            SocketCommunication.connect(reduxState.connection.currentDevice.ip, reduxState.connection.currentDevice.port);
        }
    }

    onConfigChanged(config: ConfigType) {
        for (var tid in ConfigManager.thingMetas) {
            if (ConfigManager.thingMetas[tid].category === 'alarm_system') {
                this.setState({alarmThingId: tid});
            }
        }

        if (config.display) {
            this.props.setDisplayParams(config.display);
        }

        ToastAndroid.show('Loaded new configuration', ToastAndroid.SHORT);
    }

    onAuthenticationRequired(is_required) {
        this.setState({authPasswordPage: is_required});
        if (is_required)
            ToastAndroid.show('Verboze system requires authentication', ToastAndroid.SHORT);
    }

    handleSocketConnected() {
        console.log('Socket connected!');
        this.props.setConnectionStatus(true);
        SocketCommunication.sendMessage({
            code: 0
        });
        ToastAndroid.show('Connected to Verboze system', ToastAndroid.SHORT);
    }

    handleSocketDisconnected() {
        console.log('Socket disconnected!');
        this.props.setConnectionStatus(false);
        this.props.setConfig({});
        ToastAndroid.show('Disconnected from Verboze system', ToastAndroid.SHORT);
    }

    handleDeviceDiscovered(device: DiscoveredDeviceType) {
        console.log('Found device: ', device.name, device.ip, ":", device.port);
        this.props.addDiscoveredDevice(device);
    }

    _resetScreenDim() {
        SystemSetting.setBrightnessForce(1);
        clearTimeout(this._screen_dim_timeout);
        if (!__DEV__) { // in dev mode, disable screen dimming
            this._screen_dim_timeout = setTimeout((() => {
                this.setState({
                    screenDimmed: true,
                });
                this.props.setScreenDimmingState(true);
                SystemSetting.setBrightnessForce(0);
            }).bind(this), this._screen_dim_timeout_duration);
        }
    }

    wakeupScreen() {
        if (this.state.screenDimmed) {
            this.setState({
                screenDimmed: false,
            });
            this.props.setScreenDimmingState(false);
        }
        this._resetScreenDim();
    }

    render() {
        const { connectionStatus } = this.props;
        const { screenDimmed, alarmThingId, authPasswordPage } = this.state;

        if (authPasswordPage)
            return <AuthPasswordPage onDone={(pw => {
                this.setState({authPasswordPage: false});
                if (pw) {
                    var new_token = SocketCommunication.setAuthenticationPassword(pw);
                    UserPreferences.save({'authentication-token': new_token});
                }
            }).bind(this)} />

        var inner_ui = null;
        if (screenDimmed) {
            inner_ui = <SleepView displayWarning={""}/>;
        }

        return <View style={styles.container}
            onTouchStart={this.wakeupScreen.bind(this)}
            onTouchMove={this.wakeupScreen.bind(this)}>
            <PagingView />
            {inner_ui}
            {(alarmThingId) ?
              <AlarmsHelper id={alarmThingId}
                wakeupScreen={this.wakeupScreen.bind(this)}/> : null}
            <ConnectionStatus />
        </View>
    }
}

VerbozeControl.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },
});

VerbozeControl = connect(mapStateToProps, mapDispatchToProps) (VerbozeControl);

/**
 * Create the Redux store and wrap the application in a redux context
 */

import { createStore, combineReducers, bindActionCreators } from 'redux';
import { Provider } from 'react-redux';

const settingsReducers = require('./redux-objects/reducers/settings');
const connectionReducers = require('./redux-objects/reducers/connection');
const screenReducers = require('./redux-objects/reducers/screen');
let STORE = createStore(combineReducers({
    settings: settingsReducers,
    connection: connectionReducers,
    screen: screenReducers,
}));

class VerbozeControlWrap extends React.Component<any> {
    render() {
        return <Provider store={STORE}><VerbozeControl /></Provider>
    }
}

module.exports = VerbozeControlWrap;
