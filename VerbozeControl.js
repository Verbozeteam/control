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

        Object.assign(thingsState, data);

        // console.log('thingsState: ', thingsState);
        this.setState({thingsState});
    }

    updateThing(id: string, update: Object) {
        Socket.write(JSON.stringify({
            thing: id,
            ...update
        }));
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
                updateThing={this.updateThing}/>;
        }

        return (
            <LinearGradient colors={background_gradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.container}>
                {grid}
                {loading_text}
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
