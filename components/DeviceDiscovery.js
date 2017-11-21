/* @flow */

import * as React from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet }
    from 'react-native';

const Socket = require('../lib/Socket');

import type { DiscoveredDeviceType } from '../config/flowtypes';

const I18n = require('../i18n/i18n');

type PropsType = {
    discoveredDevices: Array<DiscoveredDeviceType>,
    currentDevice: DiscoveredDeviceType,
    discoverDevices: () => null,
    setDevice: (device: DiscoveredDeviceType) => null,
};

type StateType = {};

class DeviceDiscovery extends React.Component<PropsType, StateType> {
    _keyExtractor(device: DiscoveredDeviceType, index: number): string {
        return device.ip + ':' + device.port;
    }

    _renderItem(item) {
        const { currentDevice, setDevice } = this.props;
        const device = item.item.ip + ':' + item.item.port;
        return <DeviceListItem
            device={item.item}
            selected={device === (currentDevice.ip + ':' + currentDevice.port)}
            setDevice={setDevice} />
    }

    render() {
        const { discoveredDevices, discoverDevices, setDevice } = this.props;

        var discovery_list = null;
        if (discoveredDevices.length > 0) {
            discovery_list = <FlatList
                data={discoveredDevices}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem.bind(this)} />
        }

        return (
            <View style={styles.container}>
                <Button onPress={discoverDevices}
                    title={'Discover Devices'}></Button>
                {discovery_list}
            </View>
        );
    }
}

type DeviceListItemPropsType = {
    device: DiscoveredDeviceType,
    setDevice: (device: DiscoveredDeviceType) => null,
    selected: boolean,
};

class DeviceListItem extends React.Component<DeviceListItemPropsType> {
    render() {
        const { device, selected, setDevice } = this.props;

        const title = device.name + ' ' + device.ip + ':' + device.port;

        return (
            <TouchableOpacity style={styles.list}
                onPressIn={() => {setDevice(device);}}>
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
