/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import MagicThermostatSlider from '../react-components/MagicThermostatSlider';
import MagicButton from '../react-components/MagicButton';

const I18n = require('../js-api-utils/i18n/i18n');

type StateType = {
    set_pt: number,
    temp: number,
    fan: number,
    fan_speeds: Array<string>,
    highlightButton: number, // -1 no highlight, 0 - button, 1 + button
};

type PropsType = {
    id: string,
    layout: Object,
};

class CentralAC extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        set_pt: 0,
        temp: 0,
        fan: 0,
        fan_speeds: [],
        highlightButton: -1,
    };

    _accentColor: string = "#BA3737";

    _fan_icon = require('../assets/images/fan.png');

    _max_temp: number = 30;
    _min_temp: number = 16;

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onACChanged.bind(this));
        if (newProps.id in ConfigManager.things)
            this.onACChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onACChanged(meta: ThingMetadataType, acState: ThingStateType) {
        const { set_pt, temp, fan, fan_speeds } = this.state;

        if (JSON.stringify(fan_speeds) !== JSON.stringify(meta.fan_speeds || []) ||
            set_pt !== acState.set_pt || temp !== acState.temp || fan !== acState.fan)
            this.setState({
                set_pt: acState.set_pt,
                temp: acState.temp,
                fan: acState.fan,
                fan_speeds: meta.fan_speeds,
            });
    }

    round(value: number) {
        return (Math.round(value * 2) / 2);
    }

    changeTemperature(send_socket: boolean) {
        return ((new_set_pt: number) => {
            ConfigManager.setThingState(this.props.id, {set_pt: new_set_pt}, send_socket);
        }).bind(this);
    }

    changeFan(speed: number) {
        ConfigManager.setThingState(this.props.id, {fan: speed}, true);
    }

    render() {
        const { id, layout } = this.props;
        const { set_pt, temp, fan, fan_speeds } = this.state;

        const { highlightButton } = this.state;

        var tabWidth = layout.width;

        var settingsView = null;
        var roomTemperatureView = null;

        var ac = ConfigManager.things[id];
        var isEnabled = ac.fan !== 0;

        var minusStyle = tabStyles.signsButtonsContainer;
        var plusStyle = tabStyles.signsButtonsContainer;

        var lowerTemp = () => this.changeTemperature(true)(Math.max(16, ac.set_pt - 0.5));
        var raiseTemp = () => this.changeTemperature(true)(Math.min(32, ac.set_pt + 0.5));
        var setHighlight = h => this.setState({highlightButton: h});
        if (!isEnabled) {
            lowerTemp = () => {};
            raiseTemp = () => {};
            setHighlight = (n) => {};
        }

        if (!isEnabled) {
            minusStyle = {...minusStyle, ...tabStyles.signsButtonsDisabled};
            plusStyle = {...plusStyle, ...tabStyles.signsButtonsDisabled};
        } else if (highlightButton === 0)
            minusStyle = {...minusStyle, ...tabStyles.signsButtonsHighlight};
        else if (highlightButton === 1)
            plusStyle = {...plusStyle, ...tabStyles.signsButtonsHighlight};

        roomTemperatureView = (
            <View style={tabStyles.roomTempContainer}>
                <Text style={[tabStyles.roomTempText, {fontSize: 40}]}>{ac.temp.toFixed(1) + " °C"}</Text>
                <Text style={tabStyles.roomTempText}>{"Room temperature"}</Text>
            </View>
        );

        settingsView = (
            <View style={tabStyles.settingsContainer}>
                <View style={tabStyles.settingTemp}>
                    <View style={tabStyles.settingTempButtonsContainer}>
                        <TouchableWithoutFeedback
                            onPressIn={(() => {lowerTemp(); setHighlight(0);}).bind(this)}
                            onPressOut={() => setHighlight(-1)}>
                            <View><Text style={minusStyle}>{"-"}</Text></View>
                        </TouchableWithoutFeedback>
                        <Text style={tabStyles.settingTempText}>{ac.set_pt.toFixed(1) + " °C"}</Text>
                        <TouchableWithoutFeedback
                            onPressIn={(() => {raiseTemp(); setHighlight(1);}).bind(this)}
                            onPressOut={() => setHighlight(-1)}>
                            <View><Text style={plusStyle}>{"+"}</Text></View>
                        </TouchableWithoutFeedback>
                    </View>
                    <MagicThermostatSlider  width={Math.max(tabWidth/2-40, 185)}
                                            height={50}
                                            value={ac.set_pt}
                                            enabled={isEnabled}
                                            onChange={this.changeTemperature(true)} />
                </View>
                <View style={tabStyles.settingFanContainer}>
                    <MagicButton width={70}
                                 height={70}
                                 isOn={ac.fan === 0}
                                 text={"OFF"}
                                 textColor={"#ffffff"}
                                 glowColor={this._accentColor}
                                 onPressIn={() => this.changeFan(0)}
                                 extraStyle={tabStyles.fanButton} />
                    <MagicButton width={70}
                                 height={70}
                                 isOn={ac.fan === 1}
                                 glowColor={this._accentColor}
                                 onPressIn={() => this.changeFan(1)}
                                 text={"LO"}
                                 textColor={"#ffffff"}
                                 extraStyle={tabStyles.fanButton} />
                    <MagicButton width={70}
                                 height={70}
                                 isOn={ac.fan === 2}
                                 glowColor={this._accentColor}
                                 onPressIn={() => this.changeFan(2)}
                                 text={"HI"}
                                 textColor={"#ffffff"}
                                 extraStyle={tabStyles.fanButton} />
                </View>
            </View>
        );

        return (
            <View style={{...tabStyles.container}}>
            <View style={tabStyles.leftTab}>{roomTemperatureView}</View>
                <View style={tabStyles.rightTab}>{settingsView}</View>
            </View>
        );
    }
};

const tabStyles = {
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    leftTab: {
        flex: 2,
        position: 'relative',
        height: '100%',
    },
    rightTab: {
        flex: 3,
        position: 'relative',
        height: '100%',
    },
    roomTempContainer: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
        position: 'absolute',
        bottom: 0,
    },
    roomTempText: {
        fontWeight: '100',
        color: '#ffffff',
        fontSize: 26,
        textAlign: 'left',
    },
    settingsContainer: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingTemp: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingTempButtonsContainer: {
        flexDirection: 'row',
    },
    signsButtonsContainer: {
        fontSize: 28,
        color: '#aaaaaa',
        fontWeight: '100',
        fontSize: 50,
        textAlign: 'center',
        height: 80,
        width: 80,
        flex: 1,
    },
    signsButtonsHighlight: {
        color: '#ffffff',
    },
    signsButtonsDisabled: {
        color: '#666666',
    },
    settingTempText: {
        fontWeight: '100',
        color: '#ffffff',
        fontSize: 50,
        textAlign: 'center',
        height: 80,
        flex: 3,
    },
    settingFanContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: 300,
        height: 80,
    },
    fanButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
};

module.exports = CentralAC;
