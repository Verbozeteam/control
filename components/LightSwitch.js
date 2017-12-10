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
};

type PropsType = {
    id: string,
    layout: LayoutType,
    viewType: ViewType,
};

class LightSwitch extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => {return null;};

    state = {
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
        const { intensity } = this.state;
        const { id } = this.props;

        if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
            const my_redux_state = reduxState.connection.thingStates[id];
            if (my_redux_state && my_redux_state.intensity != undefined && my_redux_state.intensity != intensity) {
                this.setState({intensity: my_redux_state.intensity});
            }
        }
    }

    changeIntensity(intensity: number) {
        SocketCommunication.sendMessage({
            thing: this.props.id,
            intensity
        });
        this.context.store.dispatch(connectionActions.set_thing_partial_state(this.props.id, {intensity}));
    }

    render() {
        const { id, layout, viewType } = this.props;
        const { intensity } = this.state;

        var on_press = () => {};
        if (viewType === 'detail')
            on_press = (() => this.changeIntensity(1-this.state.intensity)).bind(this);

        return (
            <TouchableWithoutFeedback
                onPressIn={on_press}>
              <View style={styles.container}>
                <View style={[styles.light_bulb_container, {opacity: intensity}]}>
                  <Image style={[layout, styles.light_bulb]}
                      resizeMode={'contain'}
                      source={this._light_bulb_img_on}>
                  </Image>
                </View>
                <View style={[styles.light_bulb_container, {opacity: ~~!intensity}]}>
                  <Image style={[layout, styles.light_bulb]}
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
