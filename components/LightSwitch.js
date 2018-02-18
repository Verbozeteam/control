/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import { ConfigManager } from './ConfigManager';
import type { ThingStateType, ThingMetadataType } from './ConfigManager';

const I18n = require('../i18n/i18n');

type StateType = {
    intensity: number,
    my_last_non_zero: number,
};

type PropsType = {
    id: ?string,
    onSwitch: ?(number => null),
    intensity: ?number,
};

class LightSwitch extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => null;

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
            <TouchableWithoutFeedback onPressIn={on_press}>
                <View style={styles.container}>
                    <View style={[styles.light_bulb_container, {opacity: intensity === 0 ? 0 : 1}]}>
                        <Image style={styles.light_bulb}
                            fadeDuration={0}
                            resizeMode={'contain'}
                            source={this._light_bulb_img_on}>
                        </Image>
                    </View>
                    <View style={[styles.light_bulb_container, {opacity: intensity === 0 ? 1 : 0}]}>
                        <Image style={styles.light_bulb}
                            fadeDuration={0}
                            resizeMode={'contain'}
                            source={this._light_bulb_img_off}>
                        </Image>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
});

module.exports = LightSwitch;
