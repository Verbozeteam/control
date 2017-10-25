/* @flow */

import * as React from 'react';
import { View, Text, AppRegistry, StyleSheet, Platform, DeviceEventEmitter, PanResponder }
    from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Immersive from 'react-native-immersive';

const Grid = require('./components/Grid');
const Socket = require('./lib/Socket');

const StoredDevices = require('./config/stored_devices');

import type { ConfigType, DiscoveredDevice } from './config/flowtypes';

type PropsType = {};

type StateType = {
    loading: boolean,
    config: ConfigType,
    thingsState: Object
};

class VerbozeControl extends React.Component<PropsType, StateType> {

    state = {
        loading: true,
        is_screen_dimmed: false,
        config: {},
        thingsState: {}
    };

    _screen_dim_interval = undefined;
    _last_touch_time: number = 0;
    _panResponder: Object;

    _background_gradient: Array<string> = ['#333333', '#000000'];
    _blocked_things: Array<string> = [];

    componentWillMount() {
        if (Platform.OS === 'android') {
            Immersive.on();
            Immersive.setImmersive(true);
            Immersive.addImmersiveListener(this.restoreImmersive);
        }
    }

    _onScreenPressed(evt, gestureState) {
        this._last_touch_time = (new Date).getTime();
        if (this.state.is_screen_dimmed)
            this.setState({is_screen_dimmed: false});
        console.log("wallahi got somesing");
    }

    componentDidMount() {
        /** Install screen dimmer */
        this._screen_dim_interval = setInterval(function() {
            var cur_time_ms = (new Date).getTime();
            if (cur_time_ms - this._last_touch_time > 4000) {
                this.setState({is_screen_dimmed: true});
            }
        }.bind(this), 2000);

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

            onPanResponderGrant: this._onScreenPressed.bind(this),
            onPanResponderMove: this._onScreenPressed.bind(this),
        });

        /** Install socket even handlers */
        DeviceEventEmitter.addListener(Socket.socket_connected, function() {
            console.log('Socket connected!');
            this.fetchConfig();
        }.bind(this));

        DeviceEventEmitter.addListener(Socket.socket_data, function(data) {
            // console.log(data);
            this.handleSocketData(JSON.parse(data.data));
        }.bind(this));

        DeviceEventEmitter.addListener(Socket.socket_disconnected, function() {
            console.log('Socket disconnected!');
        });

        DeviceEventEmitter.addListener(Socket.manager_log, function(data) {
            console.log(data.data);
        });

        DeviceEventEmitter.addListener(Socket.device_discovered,
            function(data: DiscoveredDevice) {
                console.log('Found name ', data.name, data.ip);
                StoredDevices.add_discovered_device(data);
                if (data.name == StoredDevices.get_current_device_name())
                    Socket.connect(data.ip, data.port);
            }.bind(this)
        );

        /** Load a saved device (if any) */
        StoredDevices.get_saved_device(function (device: DiscoveredDevice) {
            // device has been found
            Socket.connect(device.ip, device.port);
            // always discover devices (after we found our device, in case his IP changed)
            this.discoverDevices();
        }.bind(this), function (err) {
            // no device found
            console.log('No saved device to connect to...');
            this.discoverDevices(); // always discover devices
        }.bind(this));
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            Immersive.removeImmersiveListener(this.restoreImmersive);
        }

        clearInterval(this._screen_dim_interval);

        Socket.killThread();
    }

    restoreImmersive() {
        Immersive.on();
    }

    discoverDevices() {
        StoredDevices.clear_discovered_devices();
        Socket.discoverDevices();
    }

    fetchConfig() {
        console.log('fetch config');
        this.setState({
            loading: true
        });

        Socket.write(JSON.stringify({
            code: 0
        }));
    }

    applyConfig(config: ConfigType) {
        this.setState({
            loading: false,
            config: config
        });
    }

    handleSocketData(data: Object) {
        console.log('Received from middleware: ', data);
        if (Object.keys(data).length === 0)
            return;

        const { thingsState } = this.state;

        // if config provided, apply it
        if ('config' in data) {
            this.applyConfig(data.config);
            delete data['config'];
        }

        // go through thing ids and update if thing is not blocked
        for (var key in data) {
            if (this._blocked_things.indexOf(key) === -1) {
                thingsState[key] = data[key];
            }
        }

        this.setState({thingsState});
    }

    updateThing(id: string, update: Object, remote_only?: boolean) {
        remote_only = remote_only || false;

        Socket.write(JSON.stringify({
            thing: id,
            ...update
        }));
        console.log('Socket write: ', id, update, remote_only);

        if (!remote_only) {
            const { thingsState } = this.state;
            thingsState[id] = Object.assign(thingsState[id], update);
            this.setState({
                thingsState
            });
        }
    }

    blockThing(id: string) {
        this._blocked_things.push(id);
    }

    unblockThing(id: string) {
        const index = this._blocked_things.indexOf(id);
        if (index !== -1) {
            this._blocked_things.splice(index, 1);
        }
    }

    render() {

        // console.log('ROOT STATE: ', this.state);

        const { config, loading, is_screen_dimmed, thingsState } = this.state;
        const { rooms } = config;

        const background_gradient =
            rooms && rooms.layout && rooms.layout.gradient
            || this._background_gradient;

        var dimmed_overlay = null;
        if (loading || is_screen_dimmed) {
            var center_text = null;
            if (loading) { // if loading, make the center text say "loading"
                center_text = <Text style={styles.loading_text}>
                    Loading...
                </Text>
            } else { // otherwise, make it display the time
                var cur_time = new Date();
                var time_string = cur_time.getHours() + ":" + cur_time.getMinutes();
                center_text = <Text style={styles.time_display}>
                    {time_string}
                </Text>
            }
            dimmed_overlay = <View style={styles.loading_container}>
                {center_text}
            </View>;
        };

        var grid = null;
        if (rooms && !dimmed_overlay) {
            var grid = <Grid {...rooms[0]}
                thingsState={thingsState}
                updateThing={this.updateThing.bind(this)}
                blockThing={this.blockThing.bind(this)}
                unblockThing={this.unblockThing.bind(this)}/>;
        }

        // const rooms_column = <View style={styles.rooms_column}>
        //     <View style={styles.room_box}></View>
        //     <View style={styles.room_box}></View>
        //     <View style={styles.room_box}></View>
        //     <View style={styles.room_box}></View>
        // </View>

        var panAttributes = {};
        if (this._panResponder)
            panAttributes = this._panResponder.panHandlers;

        return (
            <View style={styles.container}
                  {...panAttributes}>
                {/* {rooms_column} */}
                {grid}
                {dimmed_overlay}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
        // alignItems: 'center',
        // justifyContent: 'center'
    },
    rooms_column: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: 100,
        backgroundColor: 'red',
        padding: 5
    },
    room_box: {
        height: 80,
        width: 80,
        backgroundColor: 'green',
        margin: 5
    },
    loading_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loading_text: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 20,
        color: '#FFFFFF'
    },
    time_display: {
        fontFamily: 'notoserif',
        fontSize: 160,
        color: '#AAAAAA'
    }
});

module.exports = VerbozeControl;
