/* @flow */

import * as React from 'react';
import { View, Text, AppRegistry, StyleSheet, Platform, DeviceEventEmitter }
    from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Immersive from 'react-native-immersive';

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

    componentWillMount() {
        if (Platform.OS === 'android') {
            Immersive.on();
            Immersive.setImmersive(true);
            Immersive.addImmersiveListener(this.restoreImmersive);
        }
    }

    componentDidMount() {
        console.log(connection_config.address, connection_config.port);

        Socket.connect(connection_config.address, connection_config.port);

        DeviceEventEmitter.addListener(Socket.socket_connected, function() {
            console.log('Socket connected!');
        });

        DeviceEventEmitter.addListener(Socket.socket_data, function(data) {
            console.log(data);
            this.handleSocketData(JSON.parse(data.data));
        }.bind(this));

        DeviceEventEmitter.addListener(Socket.socket_disconnected, function() {
            console.log('Socket disconnected!');
        });

        this.fetchConfig();
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            Immersive.removeImmersiveListener(this.restoreImmersive);
        }

        Socket.killThread();
    }

    restoreImmersive() {
        Immersive.on();
    }

    fetchConfig() {
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

        if ('config' in data) {
            this.applyConfig(data.config);
            delete data['config'];
        }

        for (var key in data) {
            // check if thing is blocked
            if (this._blocked_things.indexOf(key) === -1) {
                thingsState[key] = data[key];
            }
        }

        console.log(thingsState);

        // console.log('thingsState: ', thingsState);
        this.setState({thingsState});
    }

    updateThing(id: string, update: Object, remote_only?: boolean) {
        remote_only = remote_only || false;

        Socket.write(JSON.stringify({
            thing: id,
            ...update
        }));

        if (!remote_only) {
            const { thingsState } = this.state;
            thingsState[id] = update;
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

        return (
            <View style={styles.container}>
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
