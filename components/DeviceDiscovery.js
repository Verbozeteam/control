/* @flow */

import * as React from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet }
    from 'react-native';

const StoredDevices = require('../config/stored_devices');
const Socket = require('../lib/Socket');

import type { DiscoveredDeviceType } from '../config/flowtypes';

type PropsType = {
    devices: Array<{name: string, ip: string, port: number}>,
};

type StateType = {};

class DeviceDiscovery extends React.Component<PropsType, StateType> {

    static defaultProps = {
        devices: [
            {name: 'Room1', ip: '192.168.1.1', port: 5234},
            {name: 'Room2', ip: '192.168.1.2', port: 5674},
            {name: 'Room1', ip: '192.168.1.1', port: 3424},
            {name: 'Room2', ip: '192.168.1.2', port: 64345},
            {name: 'Hasan', ip: '10.11.28.41', port: 4567},
            {name: 'Room2', ip: '192.168.1.2', port: 34534},
            {name: 'Room1', ip: '192.168.1.1', port: 2345},
            {name: 'Room2', ip: '192.168.1.2', port: 7654},
            {name: 'Fituri', ip: '10.11.28.155', port: 4567}
        ]
    }

    _keyExtractor(device: DiscoveredDeviceType, index: number): string {
        return device.ip + ':' + device.port;
    }

    _renderItem(item) {
        const device = item.item.ip + ':' + item.item.port;
        const current_device = StoredDevices.get_current_device();
        return <DeviceListItem device={item.item}
            selected={device === current_device.ip + ':' + current_device.port} />
    }

    _discoveredDevices() {
        console.log('Discover devices called');
        StoredDevices.clear_discovered_devices();
        Socket.discoverDevices();
    }

    render() {
        const { devices } = this.props;

        return (
            <View style={styles.container}>
                <Button onPress={this._discoveredDevices}
                    title={'Discover Devices'}></Button>
                <FlatList
                    data={devices}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem} />
            </View>
        );
    }
}

type DeviceListItemPropsType = {
    device: DiscoveredDeviceType,
    selected: boolean,
};

class DeviceListItem extends React.Component<DeviceListItemPropsType> {

    _onPress() {
        const { device } = this.props;
        StoredDevices.set_saved_device(device);
        Socket.connect(device.ip, device.port);
    }

    render() {
        const { device, selected } = this.props;

        const title = device.name + ' ' + device.ip + ':' + device.port;

        return (
            <TouchableOpacity style={styles.list}
                onPressIn={this._onPress.bind(this)}>
                <Text style={[styles.list_text,
                    (selected) ? styles.selected : null]}>
                    {title}
                </Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    list: {
        flex: 1,
        backgroundColor: '#AAAAAA',
        height: 60,
        justifyContent: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#CCCCCC'
    },
    list_text: {
        fontFamily: 'HKNova-MediumR',
        fontSize: 17
    },
    selected: {
        color: 'blue'
    }
});

module.exports = DeviceDiscovery;
