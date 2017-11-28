/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import type { LayoutType, ViewType } from '../config/flowtypes';

const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

const I18n = require('../i18n/i18n');

type StateType = {
    currentPresetIndex: number,
};

type PropsType = {
    viewType: ViewType,
    presets: Array<Object>,
};

class PresetsSwitch extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        currentPresetIndex: 0,
    };

    _light_bulb_img_0 = require('../assets/images/lightoff.png');
    _light_bulb_img_1 = require('../assets/images/lighton.png');
    _light_bulb_img_2 = require('../assets/images/lighton_old.png');

    componentWillMount() {
        const { store } = this.context;
        this._unsubscribe = store.subscribe(this.onReduxStateChanged.bind(this));
        this.onReduxStateChanged();
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onReduxStateChanged() {
        const { store } = this.context;
        const reduxState = store.getState();
        const { currentPresetIndex } = this.state;
        const { presets } = this.props;

        if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
            var distances = [];
            var lowest_dist = 100000;
            var lowest_dist_index = -1;
            for (var i = 0; i < presets.length; i++) {
                distances.push(this.computeDistanceToPreset(presets[i], reduxState.connection.thingStates));
                if (distances[i] < lowest_dist) {
                    lowest_dist = distances[i];
                    lowest_dist_index = i;
                }
            }

            if (distances[lowest_dist_index] < distances[currentPresetIndex])
                this.setState({currentPresetIndex: lowest_dist_index});
        }
    }

    computeDistanceToPreset(preset: Object, state: Object) {
        var preset_thing_ids = Object.keys(preset).filter((thing_id) => preset[thing_id].intensity != undefined);

        var total_distance = 0;
        for (var i = 0; i < preset_thing_ids.length; i++) {
            if (preset_thing_ids[i] in state && state[preset_thing_ids[i]].intensity != undefined) {
                var diff = Math.abs(preset[preset_thing_ids[i]].intensity - state[preset_thing_ids[i]].intensity);
                if (diff == 1)
                    total_distance += 1;
                else if (diff > 1)
                    total_distance += diff / 100;
            }
        }
        return total_distance;
    }

    changePreset(new_preset: number) {
        const { presets } = this.props;

        for (var k in presets[new_preset]) {
            SocketCommunication.sendMessage({
                thing: k,
                ...presets[new_preset][k],
            });
        }
        this.context.store.dispatch(connectionActions.set_things_partial_states(presets[new_preset]));
    }

    render() {
        const { presets, viewType } = this.props;
        const { currentPresetIndex } = this.state;
        const light_bulb_img = currentPresetIndex == 2 ? this._light_bulb_img_2 : currentPresetIndex == 1 ? this._light_bulb_img_1 : this._light_bulb_img_0;

        var on_press = () => {};
        if (viewType === 'detail')
            on_press = (() => this.changePreset((this.state.currentPresetIndex + 1) % presets.length)).bind(this);

        return (
            <TouchableWithoutFeedback
                onPressIn={on_press}>
                <Image style={styles.light_bulb}
                    resizeMode='contain'
                    source={light_bulb_img}>
                </Image>
            </TouchableWithoutFeedback>
        );
    }
}
PresetsSwitch.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        overflow: 'visible',
        justifyContent: 'center',
        alignItems: 'center',
    },
    light_bulb: {
        flex: 1,
        width: undefined,
        height: undefined,
    },
});

module.exports = PresetsSwitch;
