import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import SystemSetting from 'react-native-system-setting';
const SocketCommunication = require('./lib/SocketCommunication');
const UserPreferences = require('./lib/UserPreferences');
const Clock = require('./components/Clock');
const PagingView = require('./components/PagingView');
const ConnectionStatus = require('./components/ConnectionStatus');

const connectionActions = require ('./redux-objects/actions/connection');

import type { SocketDataType, DiscoveredDeviceType } from '../config/ConnectionTypes';

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        setConnectionStatus: b => {dispatch(connectionActions.set_connection_status(b));},
        addDiscoveredDevice: d => {dispatch(connectionActions.add_discovered_device(d));},
        setCurrentDevice: d => {dispatch(connectionActions.set_current_device(d));},
        setConfig: c => {dispatch(connectionActions.set_config(c));},
        setThingsStates: thing_to_state => {dispatch(connectionActions.set_things_states(thing_to_state));},
    };
}

type StateType = {
    screenDimmed: boolean,
}

class VerbozeControl extends React.Component<{}, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        screenDimmed: false,
    };

    _screen_dim_timeout: number;
    _screen_dim_timeout_duration: number = __DEV__ ? 60000 : 30000;
    _last_touch_time: number = 0;

    _discovery_timeout: any = undefined;

    componentWillMount() {
        /** Connect to the socket communication library */
        SocketCommunication.initialize();
        SocketCommunication.setOnConnected(this.handleSocketConnected.bind(this));
        SocketCommunication.setOnMessage(this.handleSocketData.bind(this));
        SocketCommunication.setOnDisconnected(this.handleSocketDisconnected.bind(this));
        SocketCommunication.setOnDeviceDiscovered(this.handleDeviceDiscovered.bind(this));

        const { store } = this.context;
        this._unsubscribe = store.subscribe(() => { // on every state change, check if we need to connect to socket
            const reduxState = store.getState();
            if (reduxState && reduxState.connection.currentDevice)
                SocketCommunication.connect(reduxState.connection.currentDevice.ip, reduxState.connection.currentDevice.port);
        });

        /** Load user preferences */
        UserPreferences.load((() => {
            /** Load device and start discovery */
            var cur_device = UserPreferences.get('device');
            if (cur_device)
                console.log('found current device', cur_device);
                this.props.setCurrentDevice(cur_device);

            SocketCommunication.discoverDevices();
            this._discovery_timeout = setInterval(() => {
                SocketCommunication.discoverDevices();
            }, 10000);
        }).bind(this));

        /** God knows */
        SystemSetting.getVolume().then((volume) => {
            if (volume < 1) {
                SystemSetting.setVolume(1);
            }
        });

        /** Max brightness */
        SystemSetting.setBrightnessForce(1);
    }

    componentWillUnmount() {
        this._unsubscribe();
        SocketCommunication.cleanup();
        clearTimeout(this._discovery_timeout);
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

    handleSocketData(data: SocketDataType) {
        if (Object.keys(data).length == 0)
            return;

        console.log("handleSocketData: ", data);

        // if config provided, apply it
        if ('config' in data) {
            this.props.setConfig(data.config);
            delete data['config'];
        }

        if (Object.keys(data).length > 0)
            this.props.setThingsStates(data);
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
            })
            SystemSetting.setBrightnessForce(0);
        }).bind(this), this._screen_dim_timeout_duration);
    }

    _wakeupScreen() {
        if (this.state.screenDimmed)
            this.setState({
                screenDimmed: false,
            })
        this._resetScreenDim();
    }

    render() {
        var inner_ui = null;
        if (this.state.screenDimmed) {
            inner_ui = <Clock />;
        } else {
            inner_ui = <PagingView />;
        }

        return <View style={styles.container}
            onTouchStart={this._wakeupScreen.bind(this)}
            onTouchMove={this._wakeupScreen.bind(this)}>
            {inner_ui}
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
        backgroundColor: '#1a1a1a'
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
let STORE = createStore(combineReducers({
    settings: settingsReducers,
    connection: connectionReducers,
}));

class VerbozeControlWrap extends React.Component<any> {
    render() {
        return <Provider store={STORE}><VerbozeControl /></Provider>
    }
}

module.exports = VerbozeControlWrap;
