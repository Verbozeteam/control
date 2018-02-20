/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import { MagicButton } from '../react-components/MagicButton';

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

export default class LightSwitch extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        my_last_non_zero: 100,
        intensity: 0,
    };

    _light_bulb_img_on = require('../assets/images/lighton.png');
    _light_bulb_img_off = require('../assets/images/lightoff.png');

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
        const { id } = this.props;
        var { intensity, my_last_non_zero } = this.state;
        if (this.props.intensity)
            intensity = this.props.intensity;

        var my_category = 'light_switches';
        if (id)
            var my_category = ConfigManager.thingMetas[id].category;
        var intensity_after_switch = my_category === 'light_switches' ? (1 - intensity) : (intensity > 0 ? 0 : my_last_non_zero);

        var on_press = (() => this.changeIntensity(intensity_after_switch)).bind(this);

        return (
            <MagicButton
                width={70}
                height={70}
                text={I18n.t(intensity > 0 ? "ON" : "OFF")}
                onPressIn={on_press}
                isOn={intensity > 0}
                sideText={I18n.t(!id ? "ALL" : ConfigManager.thingMetas[id].name.toUpperCase())}
                glowColor={'#BA3737'}
                textColor={'#FFFFFF'}
                />
        );
    }
};
