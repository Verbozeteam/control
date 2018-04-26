/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import MagicThermostatSlider from '../react-components/MagicThermostatSlider';
import MagicButton from '../react-components/MagicButton';

const GenericCircularSliderSimple = require('../react-components/GenericCircularSliderSimple');
const GenericToggle = require('../react-components/GenericToggle');
const GenericButton = require('../react-components/GenericButton');

import { TypeFaces } from '../constants/styles';

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

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class CentralAC extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        set_pt: 0,
        temp: 0,
        fan: 0,
        fan_speeds: ['Lo', 'Hi'],
        temp_range: [16, 30],
        highlightButton: -1,
    };

    _fan_icon = require('../assets/images/fan.png');

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
        const { set_pt, temp, fan, fan_speeds, temp_range } = this.state;

        if (JSON.stringify(fan_speeds) !== JSON.stringify(meta.fan_speeds || []) ||
            JSON.stringify(temp_range) !== JSON.stringify(meta.temp_range || []) ||
            set_pt !== acState.set_pt || temp !== acState.temp || fan !== acState.fan)
            this.setState({
                set_pt: acState.set_pt,
                temp: acState.temp,
                fan: acState.fan,
                fan_speeds: meta.fan_speeds || ['Lo', 'Hi'],
                temp_range: meta.temp_range || [16, 30],
            });
    }

    round(value: number) {
        return (Math.round(value * 2) / 2);
    }

    changeTemperature(send_socket: boolean) {
        return ((new_set_pt: number) => {
            new_set_pt = this.round(new_set_pt);
            ConfigManager.setThingState(this.props.id, {set_pt: new_set_pt}, send_socket);
        }).bind(this);
    }

    changeFan(speed: number) {
        ConfigManager.setThingState(this.props.id, {fan: speed}, true);
    }

    render() {
        const { id, layout, displayConfig } = this.props;
        const { set_pt, temp, fan, fan_speeds, temp_range, highlightButton } = this.state;
        var isEnabled = fan !== 0;

        var lowerTemp = () => this.changeTemperature(true)(Math.max(temp_range[0], set_pt - 0.5));
        var raiseTemp = () => this.changeTemperature(true)(Math.min(temp_range[1], set_pt + 0.5));
        var setHighlight = h => this.setState({highlightButton: h});
        if (!isEnabled) {
            lowerTemp = () => {};
            raiseTemp = () => {};
            setHighlight = (n) => {};
        }

        switch (displayConfig.UIStyle) {
            case 'modern':
                var settingsView = null;
                var roomTemperatureView = null;

                var minusStyle = tabStyles.signsButtonsContainer;
                var plusStyle = tabStyles.signsButtonsContainer;

                if (!isEnabled) {
                    minusStyle = {...minusStyle, ...tabStyles.signsButtonsDisabled};
                    plusStyle = {...plusStyle, ...tabStyles.signsButtonsDisabled};
                } else if (highlightButton === 0)
                    minusStyle = {...minusStyle, ...tabStyles.signsButtonsHighlight};
                else if (highlightButton === 1)
                    plusStyle = {...plusStyle, ...tabStyles.signsButtonsHighlight};

                roomTemperatureView = (
                    <View style={tabStyles.roomTempContainer}>
                        <Text style={[tabStyles.roomTempText, {fontSize: 40}]}>{temp.toFixed(1) + " °C"}</Text>
                        <Text style={tabStyles.roomTempText}>{I18n.t("Room Temperature")}</Text>
                    </View>
                );

                settingsView = (
                    <View style={tabStyles.settingsContainer}>
                        <View style={tabStyles.settingTemp}>
                            <Text style={tabStyles.settingTempTitle}>{I18n.t('Set Temperature')}</Text>
                            <View style={tabStyles.settingTempButtonsContainer}>
                                <TouchableWithoutFeedback
                                    onPressIn={(() => {lowerTemp(); setHighlight(0);}).bind(this)}
                                    onPressOut={() => setHighlight(-1)}>
                                    <View><Text style={minusStyle}>{"-"}</Text></View>
                                </TouchableWithoutFeedback>
                                <Text style={tabStyles.settingTempText}>{set_pt.toFixed(1) + " °C"}</Text>
                                <TouchableWithoutFeedback
                                    onPressIn={(() => {raiseTemp(); setHighlight(1);}).bind(this)}
                                    onPressOut={() => setHighlight(-1)}>
                                    <View><Text style={plusStyle}>{"+"}</Text></View>
                                </TouchableWithoutFeedback>
                            </View>
                            <MagicThermostatSlider
                                width={Math.max(layout.width/2-40, 185)}
                                height={50}
                                margin={40}
                                minTemp={temp_range[0]}
                                maxTemp={temp_range[1]}
                                value={set_pt}
                                enabled={isEnabled}
                                onChange={this.changeTemperature(true)} />
                        </View>
                        <View style={[tabStyles.settingFanContainer, {width: (fan_speeds.length+1)*90}]}>
                            {['Off'].concat(fan_speeds).map((fs, i) =>
                                <MagicButton
                                    key={'fan-speed-'+i}
                                    width={70}
                                    height={70}
                                    isOn={fan === i}
                                    text={I18n.t(fs)}
                                    textStyle={tabStyles.fanSpeedTextStyle}
                                    textColor={"#ffffff"}
                                    glowColor={displayConfig.accentColor}
                                    onPressIn={() => this.changeFan(i)}
                                    extraStyle={fanButtonStyle} />
                                )
                            }
                        </View>
                    </View>
                );

                return (
                    <View style={{...tabStyles.container}}>
                    <View style={tabStyles.leftTab}>{roomTemperatureView}</View>
                        <View style={tabStyles.rightTab}>{settingsView}</View>
                    </View>
                );
            case 'simple':
                var center_text_main = isEnabled ? set_pt.toFixed(1) + '°C' : I18n.t('Off');
                var center_text_sub = I18n.t('Room Temp') + ' ' + temp.toFixed(1) + '°C';

                var slider = (
                    <GenericCircularSliderSimple value={set_pt}
                        minimum={temp_range[0]}
                        maximum={temp_range[1]}
                        round={this.round.bind(this)}
                        onMove={this.changeTemperature(false)}
                        onRelease={this.changeTemperature(true)}
                        diameter={layout.height / 1.5}
                        disabled={!isEnabled}
                        knobGradient={displayConfig.lightUI ? ['white', 'white'] : undefined}
                        highlightGradient={displayConfig.lightUI ? ['white', 'white'] : undefined} />
                );

                var toggle_dot = [
                    <View style={simpleStyles.toggle_dot_container}>
                        <View style={{width: 25, height: 25, borderRadius: 1000, backgroundColor: displayConfig.accentColor}}>
                        </View>
                    </View>,
                    <View style={simpleStyles.toggle_dot_container}>
                        <View style={{width: 25, height: 25, borderRadius: 1000, borderColor: displayConfig.accentColor, borderWidth: 1, opacity: fan > 0 ? 1 : 0.5}}>
                        </View>
                    </View>,
                ];

                var fan_speed_boxes = fan_speeds.map((fs, i) =>
                    <TouchableWithoutFeedback key={"fan-speed-"+i} onPressIn={() => this.changeFan(i+1)}>
                        <View style={simpleStyles.fan_speed_container}>
                            {toggle_dot[fan == (i+1) ? 0: 1]}
                            <Text style={[simpleStyles.fan_speed_text, displayConfig.lightUI ? simpleStyles.light_ui_style : {}]}>{I18n.t(fs)}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                );

                var toggles = (
                    <View style={simpleStyles.fan_controls_container}>
                        <Text style={[simpleStyles.fan_speed_text, {fontSize: 30, flex: 1}, displayConfig.lightUI ? simpleStyles.light_ui_style : {}]}>{I18n.t('Fan')}</Text>
                        {fan_speed_boxes}
                    </View>
                );

                var onoffButton = (
                    <TouchableWithoutFeedback onPressIn={() => this.changeFan(fan === 0 ? 1 : 0)}>
                        <View style={simpleStyles.button_container}>
                            <Text style={[simpleStyles.fan_speed_text, {fontSize: 30, height: 68, paddingTop: 5}, displayConfig.lightUI ? simpleStyles.light_ui_style : {}]}>{I18n.t(fan === 0 ? 'Off' : 'On')}</Text>
                            <View style={{height: fan === 0 ? 0 : 2, width: '100%', backgroundColor: displayConfig.accentColor, bottom: 0}}></View>
                        </View>
                    </TouchableWithoutFeedback>
                );

                return (
                    <View style={simpleStyles.container}>
                        <View style={simpleStyles.temperature_container}>
                            <View>
                                {slider}
                            </View>

                            {onoffButton}

                            <View style={simpleStyles.center_text_container}>
                                <Text style={[simpleStyles.center_text_main, {color: displayConfig.accentColor}, fan === 0 ? {opacity: 0.5} : {}]}>{center_text_main}</Text>
                                <Text style={[simpleStyles.center_text_sub, displayConfig.lightUI ? simpleStyles.light_ui_style : {}]}>{center_text_sub}</Text>
                            </View>
                        </View>
                        <View style={simpleStyles.fans_container}>
                            {toggles}
                        </View>
                    </View>
                );
        }
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
        color: '#ffffff',
        fontSize: 26,
        textAlign: 'left',
        ...TypeFaces.light
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
        color: '#ffffff',
        fontSize: 50,
        textAlign: 'center',
        height: 80,
        flex: 3,
        ...TypeFaces.light
    },
    settingTempTitle: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 22,
        ...TypeFaces.light
    },
    settingFanContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: 300,
        height: 80,
    },
    fanSpeedTextStyle: {
        fontSize: 20,
        ...TypeFaces.light
    }
};

const fanButtonStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
};

const simpleStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    temperature_container: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fans_container: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fan_controls_container: {
        flexDirection: 'column',
        height: 220,
    },
    fan_speed_container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    fan_speed_text: {
        fontSize: 20,
        color: '#000000',
        fontFamily: 'HKNova-MediumR',
    },
    toggle_dot_container: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    button_container: {
        position: 'absolute',
        width: 120,
        height: 70,
        flexDirection: 'column',
        backgroundColor: '#bbbbbb',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 135,
    },
    room_temperature: {
        marginTop: 20,
        fontSize: 22,
        color: '#DDDDDD',
        fontFamily: 'HKNova-MediumR'
    },
    center_text_container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    center_text_main: {
        fontSize: 70,
        color: '#3B9FFF',
        fontFamily: 'HKNova-MediumR',
        marginTop: -70
    },
    center_text_sub: {
        fontSize: 22,
        color: '#000000',
        fontFamily: 'HKNova-MediumR',
    },
    light_ui_style: {
        color: '#FFFFFF',
    },
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (CentralAC);
