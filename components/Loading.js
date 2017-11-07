/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import type { DiscoveredDeviceType } from '../config/flowtypes';

type PropsType = {
    discoveredDevices: DiscoveredDeviceType
};

type StateType = {
    is_long_press: boolean
};

const I18n = require('../i18n/i18n');

const DeviceDiscovery = require('./DeviceDiscovery');


class Loading extends React.Component<PropsType, StateType> {

    static defaultProps = {
        discoveredDevices: []
    };

    state = {
        is_long_press: false
    };

    _longPress() {
        const { is_long_press } = this.state;

        this.setState({
            is_long_press: !is_long_press
        });
    }

    render() {
        const { discoveredDevices } = this.props;
        const { is_long_press } = this.state;

        var loading_text = <Text style={styles.header}></Text>;
        if (!is_long_press) {
            loading_text = <Text style={styles.header}>
                {I18n.t('Loading...')}
            </Text>;
        }

        var device_discovery = null;
        if (is_long_press) {
            device_discovery = <DeviceDiscovery
                discoveredDevices={discoveredDevices} />;
        }

        return (
            <View style={styles.container}>
                {loading_text}
                <TouchableWithoutFeedback onLongPress={this._longPress.bind(this)}
                    delayLongPress={5000}>
                    <View style={styles.hidden_button}></View>
                </TouchableWithoutFeedback>
                {device_discovery}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000'
    },
    header: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 20,
        color: '#FFFFFF'
    },
    hidden_button: {
        position: 'absolute',
        top: 0,
        right: 0,
        height: 50,
        width: 50,
    }
});

module.exports = Loading;
