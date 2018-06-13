if (!__DEV__) {
  console.log = () => {};
}

import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { ConfigManager } from './js-api-utils/ConfigManager';
import wifi from 'react-native-android-wifi';
import Immersive from 'react-native-immersive';

import SplashScreen from 'react-native-splash-screen';

const I18n = require('./js-api-utils/i18n/i18n');
import SystemSetting from 'react-native-system-setting';
import AuthPasswordPage from './components/AuthPasswordPage';
import { SocketCommunication } from './js-api-utils/SocketCommunication';
const UserPreferences = require('./js-api-utils/UserPreferences');
import SleepView from './components/SleepView';
import AlarmsHelper from './components/AlarmsHelper';
const PagingView = require('./components/PagingView');
const ConnectionStatus = require('./components/ConnectionStatus');

const connectionActions = require ('./redux-objects/actions/connection');
const settingsActions = require ('./redux-objects/actions/settings');
const screenActions = require ('./redux-objects/actions/screen');

import type { SocketDataType, DiscoveredDeviceType } from './js-api-utils/ConnectionTypes';

function mapStateToProps(state) {
    return {
        connectionStatus: state.connection.isConnected,
        language: state.settings.language,
        targetSSID: state.connection.targetSSID,
        targetPassphrase: state.connection.targetPassphrase,
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
    };
}

type StateType = {
    screenDimmed: boolean,
    hotelThingId: string,
    alarmThingId: string,
    cardIn: boolean,
    authPasswordPage: boolean,
};

class VerbozeControl extends React.Component<{}, StateType> {
    _unsubscribe: () => any = () => null;
    _unsubscribe_config_change: () => any = () => null;
    _unsubscribe_hotel_change: () => any = () => null;

    state = {
        screenDimmed: false,
        hotelThingId: "",
        alarmThingId: "",
        cardIn: true,
        authPasswordPage: false,
    };

    _screen_dim_timeout: number;
    _screen_dim_timeout_duration: number = __DEV__ ? 30000 : 30000;
    _last_touch_time: number = 0;

    _discovery_timeout: any = undefined;
    _wifi_timeout: any = undefined;

    componentWillMount() {
        /** Connect to the socket communication library */
        console.log("Initializing sockets...");
        SocketCommunication.initialize();
        SocketCommunication.setSSLKey(null, null, "");
        SocketCommunication.setOnConnected(this.handleSocketConnected.bind(this));
        SocketCommunication.setOnDisconnected(this.handleSocketDisconnected.bind(this));
        SocketCommunication.setOnDeviceDiscovered(this.handleDeviceDiscovered.bind(this));
        SocketCommunication.setOnRequireAuthentication(() => this.setState({authPasswordPage: true}));
        ConfigManager.initialize(SocketCommunication); // this registers SocketCommunication.setOnMessage

        this._unsubscribe = this.context.store.subscribe(this.onReduxStateChanged.bind(this));
        this.onReduxStateChanged();

        /* Detect when config changes to find hotel_controls thing id */
        this._unsubscribe_config_change = ConfigManager.registerConfigChangeCallback(this.onConfigChanged.bind(this));
        if (ConfigManager.config)
            this.onConfigChanged(ConfigManager.config);

        /** Load user preferences */
        UserPreferences.load((() => {
            console.log("preferences loaded");

            /** Load saved language */
            var lang = UserPreferences.get('language');
            if (lang) {
                console.log('Language loaded from preferences: ', lang);
                this.props.setLanguage(lang);
                I18n.setLanguage(lang);
            }

            /** Load authentication token */
            SocketCommunication.setAuthenticationToken(UserPreferences.get('authentication-token'));

            /** Load device and start discovery */
            var cur_device = UserPreferences.get('device');
            if (cur_device) {
                console.log('Device loaded from preferences: ', cur_device);
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

        /** Periodic wifi connection */
        wifi.setEnabled(true);
        this.connectWifi();
        this._wifi_timeout = setInterval(this.connectWifi.bind(this), 10000);

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
        clearTimeout(this._wifi_timeout);
    }

    onReduxStateChanged() {
        // on every state change, check if we need to connect to socket
        const reduxState = this.context.store.getState();
        if (reduxState && reduxState.connection.currentDevice)
            SocketCommunication.connect(reduxState.connection.currentDevice.ip, reduxState.connection.currentDevice.port);
        if (reduxState && reduxState.connection.thingStates) {
            var hotel_thing = reduxState.connection.thingStates[this.state.hotelThingId];
            if (hotel_thing && hotel_thing.card != this.state.cardIn) {
                this.setState({cardIn: hotel_thing.card});
            }
        }
    }

    connectWifi() {
        if (this.props.targetSSID !== "") {
            wifi.getSSID(((ssid) => {
                if (ssid !== this.props.targetSSID)
                    wifi.findAndConnect(this.props.targetSSID, this.props.targetPassphrase, () => null);
            }).bind(this));
        }
    }

    onConfigChanged(config: ConfigType) {
        var hotel_things = null;
        for (var tid in ConfigManager.thingMetas) {
            if (ConfigManager.thingMetas[tid].category === 'hotel_controls') {
                if (tid !== this.state.hotelThingId) {
                    this._unsubscribe_hotel_change();
                    this._unsubscribe_hotel_change = ConfigManager.registerThingStateChangeCallback(tid, this.onHotelControlsChanged.bind(this));
                    this.setState({hotelThingId: tid});
                    if (tid in ConfigManager.things)
                        this.onHotelControlsChanged(ConfigManager.thingMetas[tid], ConfigManager.things[tid]);
                }
            }
            if (ConfigManager.thingMetas[tid].category === 'alarm_system') {
                this.setState({alarmThingId: tid});
            }
        }
    }

    onHotelControlsChanged(meta: ThingMetadataType, hcState: ThingStateType) {
        if (hcState.card !== this.state.cardIn)
            this.setState({cardIn: hcState.card});
    }

    handleSocketConnected() {
        console.log('Socket connected!');
        this.props.setConnectionStatus(true);
        SocketCommunication.sendMessage({
            code: 0
        });
    }

    handleSocketDisconnected() {
        console.log('Socket disconnected!');
        this.props.setConnectionStatus(false);
        this.props.setConfig({});
    }

    handleDeviceDiscovered(device: DiscoveredDeviceType) {
        console.log('Found device: ', device.name, device.ip, ":", device.port);
        this.props.addDiscoveredDevice(device);
    }

    _resetScreenDim() {
        SystemSetting.setBrightnessForce(1);
        clearTimeout(this._screen_dim_timeout);
        this._screen_dim_timeout = setTimeout((() => {
            this.setState({
                screenDimmed: true,
            });
            this.props.setScreenDimmingState(true);
            SystemSetting.setBrightnessForce(0);
        }).bind(this), this._screen_dim_timeout_duration);
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
        const { screenDimmed, alarmThingId, cardIn, authPasswordPage } = this.state;

        if (authPasswordPage)
            return <AuthPasswordPage onDone={(pw => {
                this.setState({authPasswordPage: false});
                if (pw) {
                    var new_token = SocketCommunication.setAuthenticationPassword(pw);
                    UserPreferences.save({'authentication-token': new_token});
                }
            }).bind(this)} />

        var inner_ui = null;
        if (screenDimmed || (!cardIn && connectionStatus)) {
            inner_ui = <SleepView displayWarning={(cardIn || !connectionStatus) ? "" : I18n.t("Please insert the room card to use.")}/>;
        }

        return <View style={styles.container}
            onTouchStart={(cardIn || !connectionStatus) ? this.wakeupScreen.bind(this) : null}
            onTouchMove={(cardIn || !connectionStatus) ? this.wakeupScreen.bind(this) : null}>
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
