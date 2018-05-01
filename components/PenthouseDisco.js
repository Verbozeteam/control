/* @flow */

import * as React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Image } from 'react-native';
import Svg, { Rect, Polyline } from 'react-native-svg'
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
    lights: number,
    exhaust: number,
    fog: number,
    motor: number,
    has_fog: boolean,
    has_exhaust: boolean,
    has_lights: boolean,
};

type PropsType = {
    id: string,
    layout: Object,
    displayConfig: Object,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class PenthouseDiscoPanel extends React.Component<PropsType, StateType>  {
    _unsubscribe: () => any = () => null;

    _fog_off_img: number = require('../assets/images/basic_ui/fog_off.png');
    _fog_off_light_img: number = require('../assets/images/basic_ui/light_ui/fog_off.png');
    _fog_on_img: number = require('../assets/images/basic_ui/fog_on.png');
    _fog_on_light_img: number = this._fog_on_img;
    _exhaust_off_img: number = require('../assets/images/basic_ui/fan_off.png');
    _exhaust_off_light_img: number = require('../assets/images/basic_ui/light_ui/fan_off.png');
    _exhaust_on_img: number = require('../assets/images/basic_ui/fan_on.png');
    _exhaust_on_light_img: number = this._exhaust_on_img;
    _light_off_img: number = require('../assets/images/basic_ui/lightoff.png');
    _light_on_img: number = require('../assets/images/basic_ui/lighton.png');
    _light_off_light_img: number = require('../assets/images/basic_ui/light_ui/lightoff.png');
    _light_on_light_img: number = require('../assets/images/basic_ui/light_ui/lighton.png');

    state = {
        motor: 0,
        fog: 0,
        exhaust: 0,
        lights: 0,
        has_fog: false,
        has_exhaust: false,
        has_lights: false,
    };

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onDiscoChanged.bind(this));
        if (newProps.id in ConfigManager.things && newProps.id in ConfigManager.thingMetas)
            this.onDiscoChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onDiscoChanged(meta: ThingMetadataType, dState: ThingStateType) {
        const { motor, fog, exhaust, lights, has_fog, has_exhaust, has_lights } = this.state;

        if (has_fog !== (meta.has_fog || false) ||
            has_exhaust !== (meta.has_exhaust || false) ||
            has_lights !== (meta.has_lights || false) ||
            motor !== dState.motor || exhaust !== dState.exhaust || fog !== dState.fog || lights !== dState.lights)
            this.setState({
                fog: dState.fog,
                exhaust: dState.exhaust,
                lights: dState.lights,
                motor: dState.motor,
                has_fog: meta.has_fog || false,
                has_exhaust: meta.has_exhaust || false,
                has_lights: meta.has_lights || false,
            });
    }

    setFog(state: number) {
        ConfigManager.setThingState(this.props.id, {fog: state}, true);
    }

    setExhaust(state: number) {
        ConfigManager.setThingState(this.props.id, {exhaust: state}, true);
    }

    setLights(state: number) {
        ConfigManager.setThingState(this.props.id, {lights: state}, true);
    }

    setMotor(state: number) {
        ConfigManager.setThingState(this.props.id, {motor: state}, true);
    }

    render() {
        const { motor, fog, exhaust, lights, has_fog, has_exhaust, has_lights } = this.state;
        const { displayConfig } = this.props;

        var openColor = motor === 1 ? displayConfig.accentColor : (displayConfig.lightUI ? '#FFFFFF' : '#000000');
        var closeColor = motor === 2 ? displayConfig.accentColor : (displayConfig.lightUI ? '#FFFFFF' : '#000000');

        return (
            <View style={styles.container}>
                <View style={styles.subcontainer}>
                    <TouchableWithoutFeedback onPressIn={() => this.setMotor(motor == 1 ? 0 : 1)}>
                        <View style={styles.quadrant}>
                            <Svg width={180} height={180}>
                                <Rect x="0" y="0" width="180" height="180" fill={'rgba(0,0,0,0)'} strokeWidth="4" stroke={openColor} />
                                <Polyline points="80,20 20,90 80,160" fill={'rgba(0,0,0,0)'} strokeWidth="4" stroke={openColor} />
                                <Polyline points="100,20 160,90 100,160" fill={'rgba(0,0,0,0)'} strokeWidth="4" stroke={openColor} />
                            </Svg>
                            <Text style={[styles.text, {color: displayConfig.textColor}]}>{I18n.t('Open Ceiling')}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPressIn={() => this.setMotor(motor == 2 ? 0 : 2)}>
                        <View style={styles.quadrant}>
                            <Svg width={180} height={180}>
                                <Rect x="0" y="0" width="180" height="180" fill={'rgba(0,0,0,0)'} strokeWidth="4" stroke={closeColor} />
                                <Polyline points="20,20 80,90 20,160" fill={'rgba(0,0,0,0)'} strokeWidth="4" stroke={closeColor} />
                                <Polyline points="160,20 100,90 160,160" fill={'rgba(0,0,0,0)'} strokeWidth="4" stroke={closeColor} />
                            </Svg>
                            <Text style={[styles.text, {color: displayConfig.textColor}]}>{I18n.t('Close Ceiling')}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View style={styles.subcontainer}>
                    {has_fog ? <TouchableWithoutFeedback onPressIn={() => this.setFog(fog ? 0 : 1)}>
                        <View style={styles.quadrant}>
                            <View style={{width: 180, height: 180}}>
                                <View style={[styles.img_container, {opacity: fog === 0 ? 0 : 1}]}>
                                    <Image style={styles.image}
                                        fadeDuration={0}
                                        resizeMode={'contain'}
                                        source={displayConfig.lightUI ? this._fog_on_light_img : this._fog_on_img}>
                                    </Image>
                                </View>
                                <View style={[styles.img_container, {opacity: fog === 0 ? 1 : 0}]}>
                                    <Image style={styles.image}
                                        fadeDuration={0}
                                        resizeMode={'contain'}
                                        source={displayConfig.lightUI ? this._fog_off_light_img : this._fog_off_img}>
                                    </Image>
                                </View>
                            </View>
                            <Text style={[styles.text, {color: displayConfig.textColor}]}>{I18n.t('Fog')}</Text>
                        </View>
                    </TouchableWithoutFeedback> : null}
                    {has_exhaust ? <TouchableWithoutFeedback onPressIn={() => this.setExhaust(exhaust ? 0 : 1)}>
                        <View style={styles.quadrant}>
                            <View style={{width: 180, height: 180}}>
                                <View style={[styles.img_container, {opacity: exhaust === 0 ? 0 : 1}]}>
                                    <Image style={styles.image}
                                        fadeDuration={0}
                                        resizeMode={'contain'}
                                        source={displayConfig.lightUI ? this._exhaust_on_light_img : this._exhaust_on_img}>
                                    </Image>
                                </View>
                                <View style={[styles.img_container, {opacity: exhaust === 0 ? 1 : 0}]}>
                                    <Image style={styles.image}
                                        fadeDuration={0}
                                        resizeMode={'contain'}
                                        source={displayConfig.lightUI ? this._exhaust_off_light_img : this._exhaust_off_img}>
                                    </Image>
                                </View>
                            </View>
                            <Text style={[styles.text, {color: displayConfig.textColor}]}>{I18n.t('Exhaust')}</Text>
                        </View>
                    </TouchableWithoutFeedback> : null}
                    {has_lights ? <TouchableWithoutFeedback onPressIn={() => this.setLights(lights ? 0 : 1)}>
                        <View style={styles.quadrant}>
                            <View style={{width: 180, height: 180}}>
                                <View style={[styles.img_container, {opacity: lights === 0 ? 0 : 1}]}>
                                    <Image style={styles.image}
                                        fadeDuration={0}
                                        resizeMode={'contain'}
                                        source={displayConfig.lightUI ? this._light_on_light_img : this._light_on_img}>
                                    </Image>
                                </View>
                                <View style={[styles.img_container, {opacity: lights === 0 ? 1 : 0}]}>
                                    <Image style={styles.image}
                                        fadeDuration={0}
                                        resizeMode={'contain'}
                                        source={displayConfig.lightUI ? this._light_off_light_img : this._light_off_img}>
                                    </Image>
                                </View>
                            </View>
                            <Text style={[styles.text, {color: displayConfig.textColor}]}>{I18n.t('Lights')}</Text>
                        </View>
                    </TouchableWithoutFeedback> : null}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    subcontainer: {
        flex: 1,
        flexDirection: 'row',
    },
    quadrant: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 22,
        ...TypeFaces.regular,
    },
    img_container: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%'
    },
    image: {
        flex: 1,
        width: undefined,
        height: undefined,
    },
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (PenthouseDiscoPanel);
