/* @flow */

import * as React from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet }
    from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const I18n = require('../js-api-utils/i18n/i18n');
import { SocketCommunication } from '../js-api-utils/SocketCommunication';

const connectionActions = require ('../redux-objects/actions/connection');
const UserPreferences = require('../js-api-utils/UserPreferences');

import type { DiscoveredDeviceType } from '../js-api-utils/ConnectionTypes';

function mapStateToProps(state) {
    return {
        discoveredDevices: state.connection.discoveredDevices,
        currentDevice: state.connection.currentDevice,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentDevice: (d: DiscoveredDeviceType) => {dispatch(connectionActions.set_current_device(d));},
        clearDiscoveredDevices: () => {dispatch(connectionActions.clear_discovered_devices());},
    };
}

class DeviceDiscoveryView extends React.Component<any> {
    _unsubscribe: () => null = () => {return null;};

    componentWillMount() {
        const { store } = this.context;
        this._unsubscribe = store.subscribe(() => {});
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    _keyExtractor(device: DiscoveredDeviceType, index: number): string {
        return device.name + ':' + device.ip + ':' + device.port;
    }

    onDeviceClicked(dev: DiscoveredDeviceType) {
        this.props.setCurrentDevice(dev);
        UserPreferences.save({
            device: dev,
        });
    }

    _renderItem(item) {
        const device = item.item.ip + ':' + item.item.port;
        return <DeviceListItem
            device={item.item}
            selected={this.props.currentDevice && device === (this.props.currentDevice.ip + ':' + this.props.currentDevice.port)}
            setDevice={this.onDeviceClicked.bind(this)} />
    }

    render() {
        var discovery_list = null;
        if (this.props.discoveredDevices.length > 0) {
            discovery_list = <FlatList
                data={this.props.discoveredDevices}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem.bind(this)} />
        }

        return (
            <View style={styles.container}>
                <View style={styles.button_container}>
                    <View style={styles.button}>
                        <Button
                            onPress={() => SocketCommunication.discoverDevices()}
                            title={'Discover Devices'} />
                    </View>
                    <View style={styles.button}>
                        <Button
                            onPress={this.props.clearDiscoveredDevices}
                            title={'Clear List'} />
                    </View>
                </View>
                {discovery_list}
            </View>
        );
    }
}

DeviceDiscoveryView.contextTypes = {
    store: PropTypes.object
};

type DeviceListItemPropsType = {
    device: DiscoveredDeviceType,
    setDevice: (device: DiscoveredDeviceType) => any,
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
        flex: 2,
    },
    button_container: {
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        padding: 2,
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

module.exports = connect(mapStateToProps, mapDispatchToProps) (DeviceDiscoveryView);
