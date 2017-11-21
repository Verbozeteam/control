/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, Picker } from 'react-native';

const I18n = require('../i18n/i18n');
const UserPreferences = require('../config/user_preferences');

import type { LayoutType, DiscoveredDeviceType } from '../config/flowtypes';

const PanelHeader = require('./PanelHeader');
const DeviceDiscovery = require('./DeviceDiscovery');

type PropsType = {
    showDiscoverDevices: boolean,
    discoveredDevices: Array<DiscoveredDeviceType>,
    currentDevice: DiscoveredDeviceType,
    discoverDevices: () => null,
    setDevice: (device: DiscoveredDeviceType) => null,
    layout: {...LayoutType, margin: number},
    settings: Object,
    refresh: () => null
};

type StateType = {};

class Settings extends React.Component<PropsType, StateType> {
    changeLanguage(itemValue, itemIndex) {
        const { refresh } = this.props;

        UserPreferences.save({'language': itemValue});
        I18n.setLanguage(itemValue);
        refresh();
    }

    render() {
        const { layout, settings, showDiscoverDevices,
            discoveredDevices, discoverDevices, setDevice, currentDevice } = this.props;

        var device_discovery = null;
        if (showDiscoverDevices) {
            device_discovery = <DeviceDiscovery
                discoveredDevices={discoveredDevices}
                discoverDevices={discoverDevices}
                setDevice={setDevice}
                currentDevice={currentDevice} />;
        }

        var settings_list = [];
        for (var i = 0; i < settings.length; i++) {

            const header = <Text style={styles.setting_header}>
                {I18n.t(settings[i].name)}
            </Text>;

            var options = [];
            for (var j = 0; j < settings[i].options.length; j++) {
                options.push(<Picker.Item key={settings[i].name + '-option-' + j}
                    label={settings[i].options[j][0]}
                    value={settings[i].options[j][1]} />);
            }

            var action = () => null;
            var selected_value: string = '';
            if (settings[i].action === 'changeLanguage') {
                action = this.changeLanguage.bind(this);
                selected_value = I18n.setLanguage();
            }

            const setting = <View key={'setting-' + i}
                style={styles.setting_container}>
                {header}
                <Picker selectedValue={selected_value}
                    onValueChange={action}
                    style={styles.picker}>
                    {options}
                </Picker>
            </View>;

            settings_list.push(setting);
        }

        return (
            <View style={[layout, styles.container]}>
                <PanelHeader name={'Settings'} />
                {settings_list}
                {device_discovery}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        backgroundColor: '#2D383E'
    },
    setting_container: {
        flex: 1,
    },
    setting_header: {
        fontSize: 20,
        fontFamily: 'HKNova-MediumR',
        color: '#FFFFFF'
    },
    picker: {
        color: '#FFFFFF',
    }
});

module.exports = Settings;
