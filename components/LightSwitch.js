/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import type { LayoutType, ViewType } from '../config/flowtypes';

const connectionActions = require('../redux-objects/actions/connection');
const SocketCommunication = require('../lib/SocketCommunication');

const I18n = require('../i18n/i18n');

type StateType = {
    intensity: number,
    my_category: string,
    my_last_non_zero: number,
};

type PropsType = {
    id?: string,
    onSwitch?: number => null,
    layout: LayoutType,
    viewType: ViewType,
    intensity?: number,
};

class LightSwitch extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
        my_category: 'light_switches',
        my_last_non_zero: 100,
        intensity: 0,
    };

    _light_bulb_img_on = require('../assets/images/lighton.png');
    _light_bulb_img_off = require('../assets/images/lightoff.png');

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
        const { intensity, my_category, my_last_non_zero } = this.state;
        const { id } = this.props;

        if (id) {
            var total_change = {};
            if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
                const my_redux_state = reduxState.connection.thingStates[id];
                if (my_redux_state && my_redux_state.category !== my_category)
                    total_change.my_category = my_redux_state.category;
                if (my_redux_state && my_redux_state.intensity != undefined && my_redux_state.intensity != intensity)
                    total_change.intensity = my_redux_state.intensity;
                if (my_redux_state && my_redux_state.intensity && my_redux_state.intensity !== my_last_non_zero)
                    total_change.my_last_non_zero = my_redux_state.intensity;
            }
            if (Object.keys(total_change).length > 0)
                this.setState(total_change);
        }
    }

    changeIntensity(intensity: number) {
        if (this.props.onSwitch)
            this.props.onSwitch(intensity);
        if (this.props.id) {
            SocketCommunication.sendMessage({
                thing: this.props.id,
                intensity
            });
            this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {intensity}));
        }
    }

    render() {
        const { id, layout, viewType } = this.props;
        var { intensity, my_category, my_last_non_zero } = this.state;
        if (this.props.intensity)
            intensity = this.props.intensity;

        var intensity_after_switch = my_category === 'light_switches' ? (1 - intensity) : (intensity > 0 ? 0 : my_last_non_zero);

        var on_press = () => {};
        if (viewType === 'detail')
            on_press = (() => this.changeIntensity(intensity_after_switch)).bind(this);

        return (
            <TouchableWithoutFeedback
                onPressIn={on_press}>
              <View style={styles.container}>
                <View style={[styles.light_bulb_container, {opacity: intensity === 0 ? 0 : 1}]}>
                  <Image style={[layout, styles.light_bulb]}
                    fadeDuration={0}
                    resizeMode={'contain'}
                    source={this._light_bulb_img_on}>
                  </Image>
                </View>
                <View style={[styles.light_bulb_container, {opacity: intensity === 0 ? 1 : 0}]}>
                  <Image style={[layout, styles.light_bulb]}
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
LightSwitch.contextTypes = {
    store: PropTypes.object
};

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
