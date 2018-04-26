/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import MagicButton from '../react-components/MagicButton';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type StateType = {
    intensity: number,
    my_last_non_zero: number,
};

type PropsType = {
    id: ?string,
    onSwitch?: number => any,
    intensity?: number,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class LightSwitch extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        my_last_non_zero: 100,
        intensity: 0,
    };

    _light_bulb_img_on = require('../assets/images/basic_ui/lighton.png');
    _light_bulb_img_off = require('../assets/images/basic_ui//lightoff.png');
    _light_bulb_light_img_on = require('../assets/images/basic_ui/light_ui/lighton.png');
    _light_bulb_light_img_off = require('../assets/images/basic_ui/light_ui/lightoff.png');

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        if (newProps.id) {
            this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onLightChanged.bind(this));
            if (newProps.id && newProps.id in ConfigManager.things)
                this.onLightChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onLightChanged(meta: ThingMetadataType, lightState: ThingStateType) {
        const { intensity, my_last_non_zero } = this.state;

        var total_change = {};
        if (lightState.intensity !== intensity)
            total_change.intensity = lightState.intensity;
        if (lightState.intensity !== 0)
            total_change.my_last_non_zero = lightState.intensity;

        if (Object.keys(total_change).length > 0)
            this.setState(total_change);
    }

    changeIntensity(intensity: number) {
        if (this.props.onSwitch)
            this.props.onSwitch(intensity);
        if (this.props.id) {
            ConfigManager.setThingState(this.props.id, {intensity}, true);
        }
    }

    render() {
        const { id, displayConfig } = this.props;
        var { intensity, my_last_non_zero } = this.state;
        if (this.props.intensity)
            intensity = this.props.intensity;

        var my_category = 'light_switches';
        if (id && id in ConfigManager.thingMetas)
            var my_category = ConfigManager.thingMetas[id].category;
        var intensity_after_switch = my_category === 'light_switches' ? (1 - intensity) : (intensity > 0 ? 0 : 100);

        var on_press = (() => this.changeIntensity(intensity_after_switch)).bind(this);
        var name = I18n.t(!id ? "All" : ConfigManager.thingMetas[id].name);

        switch (displayConfig.UIStyle) {
            case 'modern':
                return (
                    <MagicButton
                        width={70}
                        height={70}
                        text={I18n.t(intensity > 0 ? "On" : "Off")}
                        textStyle={{...TypeFaces.light}}
                        onPressIn={on_press}
                        isOn={intensity > 0}
                        sideText={name}
                        sideTextStyle={{...TypeFaces.light}}
                        glowColor={displayConfig.accentColor}
                        textColor={'#FFFFFF'}
                        />
                );
            case 'simple':
                var layout = {};
                return (
                    <TouchableWithoutFeedback onPressIn={on_press}>
                        <View style={simpleStyles.container}>
                            <View style={[simpleStyles.light_bulb_container, {opacity: intensity === 0 ? 0 : 1}]}>
                                <Image style={[layout, simpleStyles.light_bulb]}
                                    fadeDuration={0}
                                    resizeMode={'contain'}
                                    source={displayConfig.lightUI ? this._light_bulb_light_img_on : this._light_bulb_img_on}>
                                </Image>
                            </View>
                            <View style={[simpleStyles.light_bulb_container, {opacity: intensity === 0 ? 1 : 0}]}>
                                <Image style={[layout, simpleStyles.light_bulb]}
                                    fadeDuration={0}
                                    resizeMode={'contain'}
                                    source={displayConfig.lightUI ? this._light_bulb_light_img_off : this._light_bulb_img_off}>
                                </Image>
                            </View>
                            <Text style={[simpleStyles.text, {color: displayConfig.lightUI ? 'white' : 'black', ...TypeFaces.regular}]}>{name}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                );
        }
    }
};


const simpleStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    light_bulb_container: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%'
    },
    light_bulb: {
        flex: 1,
        width: undefined,
        height: undefined,
    },
    text: {
        width: '100%',
        textAlign: 'center',
        position: 'absolute',
        bottom: 0,
        fontSize: 20,
        ...TypeFaces.light
    }
});

module.exports = connect(mapStateToProps, mapDispatchToProps) (LightSwitch);
