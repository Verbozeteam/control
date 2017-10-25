/* @flow */

import * as React from 'react';
import { View, Text, AppRegistry, StyleSheet, Platform, DeviceEventEmitter,
    PanResponder } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

const Grid = require('./components/Grid');
const Socket = require('./lib/Socket');

const StoredDevices = require('./config/stored_devices');

import type { ConfigType, DiscoveredDevice } from './config/flowtypes';

type PropsType = {};

type StateType = {
    loading: boolean,
    config: ConfigType,
    thingsState: Object,
    is_screen_dimmed: boolean
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
    _screen_timeout_duration = 30000;

    _background_gradient: Array<string> = ['#333333', '#000000'];
    _blocked_things: Array<string> = [];

    _days_of_week: Array<string> = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'];

    _months_of_year: Array<string> = ['January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August', 'September', 'October',
        'November', 'December']

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
            if (cur_time_ms - this._last_touch_time >
                this._screen_timeout_duration) {
                this.setState({is_screen_dimmed: true});
            }
        }.bind(this), 5000);

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,

            onPanResponderGrant: this._onScreenPressed.bind(this),
            onPanResponderMove: this._onScreenPressed.bind(this),
        });

        /** Install socket event handlers */
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
        StoredDevices.set_saved_device({name: 'Fituri', ip: '10.11.28.155', port: 4567});
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
        clearInterval(this._screen_dim_interval);

        Socket.killThread();
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

    _formatDateTime(datetime: Object) {

        console.log(this._days_of_week[0]);

        var minutes = String(datetime.getMinutes());
        if (minutes.length < 2) {
            minutes = '0' + minutes;
        }

        var am_pm = ' AM';
        var hours = datetime.getHours();
        if (hours > 12) {
            hours -= 12;
            am_pm = ' PM';
        }

        // const date = this._days_of_week[0];
        const date = this._days_of_week[datetime.getDay()] + ', ' +
            datetime.getDate() + ' ' + this._months_of_year[datetime.getMonth()]
            + ' ' + datetime.getFullYear();

        return {
            time: hours + ':' + minutes + am_pm,
            date
        };
    }

    render() {

        // console.log('ROOT STATE: ', this.state);

        const { config, loading, is_screen_dimmed, thingsState } = this.state;
        const { rooms } = config;

        const background_gradient =
            rooms && rooms.layout && rooms.layout.gradient
            || this._background_gradient;

        // var dimmed_overlay = null;
        // if (loading || is_screen_dimmed) {
        //     var time_text = null;
        //     var date_text = null;
        //     if (loading) { // if loading, make the center text say "loading"
        //         center_text = <Text style={styles.loading_text}>
        //             Loading...
        //         </Text>
        //     } else { // otherwise, make it display the time
        //         const { time, date } = this._formatDateTime(new Date());
        //         time_text = <Text style={styles.time_display}>
        //             {time}
        //         </Text>
        //     }
        //     dimmed_overlay = <View style={styles.loading_container}>
        //         {time_text}
        //         {date_text}
        //     </View>;
        // };

        var dimmed_overlay = null;
        if (loading || is_screen_dimmed) {
            var heading = null;
            var subheading = null;

            // if loading, make the heading say "loading"
            if (loading) {
                heading = <Text style={styles.loading_text}>
                    Loading....
                </Text>
            }

            // othwerise, make it display date and time
            else {
                const { time, date } = this._formatDateTime(new Date());
                heading = <Text style={styles.time_display}>
                    {time}
                </Text>
                subheading = <Text style={styles.date_display}>
                    {date}
                </Text>
            }

            dimmed_overlay = <View style={styles.loading_container}>
                {heading}
                {subheading}
            </View>;
        }

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
        fontFamily: 'HKNova-MediumR',
        fontSize: 120,
        color: '#AAAAAA'
    },
    date_display: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 40,
        color: '#AAAAAA'
    }
});

module.exports = VerbozeControl;
