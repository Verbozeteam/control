/* @flow */

import * as React from 'react';
import { View, Text, AppRegistry, StyleSheet, Platform, DeviceEventEmitter }
    from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

const Grid = require('./components/Grid');
const Socket = require('./lib/Socket');

const connection_config = require('./config/connection_config');

import type { ConfigType } from './config/flowtypes';

type PropsType = {};

type StateType = {
    loading: boolean,
    config: ConfigType,
    thingsState: Object
};

class VerbozeControl extends React.Component<PropsType, StateType> {

    state = {
        loading: true,
        config: {},
        thingsState: {}
    };

    _background_gradient: Array<string> = ['#333333', '#000000'];
    _blocked_things: Array<string> = [];

    componentDidMount() {
        DeviceEventEmitter.addListener(Socket.socket_connected, function() {
            console.log('Socket connected!');
        });

        DeviceEventEmitter.addListener(Socket.socket_data, function(data) {
            // console.log(data);
            this.handleSocketData(JSON.parse(data.data));
        }.bind(this));

        DeviceEventEmitter.addListener(Socket.socket_disconnected, function() {
            console.log('Socket disconnected!');
        });

        // if (__DEV__) {
        Socket.connect(connection_config.address, connection_config.port);
        this.fetchConfig();
        // } else {
        //     Socket.discoverDevices();
        //
        //     DeviceEventEmitter.addListener(Socket.device_discovered,
        //         function(data) {
        //             console.log('Found name', data.name, data.ip);
        //             Socket.connect(data.ip, 7990);
        //             this.fetchConfig();
        //         }.bind(this)
        //     );
        // }
    }

    componentWillUnmount() {
        Socket.killThread();
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

        const { config, loading, thingsState } = this.state;
        const { rooms } = config;

        const background_gradient =
            rooms && rooms.layout && rooms.layout.gradient
            || this._background_gradient;


        var loading_text = null;
        if (loading) {
            loading_text = <View style={styles.loading_container}>
                <Text style={styles.loading_text}>
                    Loading...
                </Text>
            </View>;
        };

        var grid = null;
        if (rooms) {
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

        return (
            <View style={styles.container}>
                {/* {rooms_column} */}
                {grid}
                {loading_text}
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
    }
});

module.exports = VerbozeControl;
