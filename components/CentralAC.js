/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import { ConfigManager } from './ConfigManager';
import type { ThingStateType, ThingMetadataType } from './ConfigManager';

import { ACSlider } from './ACSlider';
import { MagicCircle } from './MagicCircle';

const I18n = require('../i18n/i18n');

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

        var minusProps = !isEnabled ? {
            style: tabStyles.signsButtonsContainer
        } : {
            onMouseLeave: (() => this.setState({highlightButton: -1})).bind(this),
            onMouseEnter: (() => this.setState({highlightButton: 0})).bind(this),
            onClick: () => this.changeTemperature(true)(Math.max(16, ac.set_pt - 0.5)),
            style: tabStyles.signsButtonsContainer
        };
        var plusProps = !isEnabled ? {
            style: tabStyles.signsButtonsContainer
        } : {
            onMouseLeave: (() => this.setState({highlightButton: -1})).bind(this),
            onMouseEnter: (() => this.setState({highlightButton: 1})).bind(this),
            onClick: () => this.changeTemperature(true)(Math.min(32, ac.set_pt + 0.5)),
            style: tabStyles.signsButtonsContainer,
        };

        if (!isEnabled) {
            minusProps.style = {...minusProps.style, ...tabStyles.signsButtonsDisabled};
            plusProps.style = {...plusProps.style, ...tabStyles.signsButtonsDisabled};
        } else if (highlightButton === 0)
            minusProps.style = {...minusProps.style, ...tabStyles.signsButtonsHighlight};
        else if (highlightButton === 1)
            plusProps.style = {...plusProps.style, ...tabStyles.signsButtonsHighlight};

        roomTemperatureView = (
            <View style={tabStyles.roomTempContainer}>
                <Text style={tabStyles.roomTempText}>{ac.temp.toFixed(1) + " °C"}</Text>
                <Text style={tabStyles.roomTempText}>{"Room temperature"}</Text>
            </View>
        );

        settingsView = (
            <View style={tabStyles.settingsContainer}>
                <View style={tabStyles.settingTemp}>
                    <View style={tabStyles.settingTempButtonsContainer}>
                        <Text {...minusProps}>{"-"}</Text>
                        <Text style={tabStyles.settingTempText}>{ac.set_pt.toFixed(1) + " °C"}</Text>
                        <Text {...plusProps}>{"+"}</Text>
                    </View>
                    <ACSlider width={Math.max(tabWidth/2-40, 185)}
                              height={30}
                              value={ac.set_pt}
                              enabled={isEnabled}
                              onChange={this.changeTemperature(true)} />
                </View>
                <View style={tabStyles.settingFanContainer}>
                    <MagicCircle width={70}
                                 height={70}
                                 isOn={ac.fan === 0}
                                 text={"OFF"}
                                 textColor={"#ffffff"}
                                 glowColor={this._accentColor}
                                 onClick={() => this.changeFan(0)}
                                 extraStyle={tabStyles.fanButton} />
                    <MagicCircle width={70}
                                 height={70}
                                 isOn={ac.fan === 1}
                                 glowColor={this._accentColor}
                                 onClick={() => this.changeFan(1)}
                                 text={"LO"}
                                 textColor={"#ffffff"}
                                 extraStyle={tabStyles.fanButton} />
                    <MagicCircle width={70}
                                 height={70}
                                 isOn={ac.fan === 2}
                                 glowColor={this._accentColor}
                                 onClick={() => this.changeFan(2)}
                                 text={"HI"}
                                 textColor={"#ffffff"}
                                 extraStyle={tabStyles.fanButton} />
                </View>
            </View>
        );

        return (
            <View style={{...tabStyles.container}}>
                <View style={tabStyles.leftTab}>{settingsView}</View>
                <View style={tabStyles.rightTab}>{roomTemperatureView}</View>
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
        flex: 2,
        position: 'relative',
        height: '100%',
    },
    roomTempContainer: {
        width: 140,
        position: 'absolute',
        bottom: 0,
    },
    roomTempText: {
        fontWeight: '100',
        color: '#ffffff',
        fontSize: 22,
    },
    settingsContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingTemp: {
        flex: 1,
    },
    settingTempButtonsContainer: {
        display: 'flex',
        flexDirection: 'row',
    },
    signsButtonsContainer: {
        fontSize: 28,
        lineHeight: 2,
        color: '#aaaaaa',
        fontWeight: '100',
        fontSize: 20,
        textAlign: 'center',
        lineHeight: 3,
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
        fontSize: 20,
        textAlign: 'center',
        lineHeight: 3,
        flex: 3
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
