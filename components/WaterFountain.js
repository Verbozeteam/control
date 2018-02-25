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
    id?: string,
    layout: LayoutType,
    viewType: ViewType,
};

class WaterFountain extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => null;

    state: StateType = {
        intensity: 0,
    };

    _fountain_img_on = require('../assets/images/fountain_on.png');
    _fountain_img_off = require('../assets/images/fountain_off.png');

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

        if (id) {
            var total_change = {};
            if (reduxState && reduxState.connection && reduxState.connection.thingStates) {
                const my_redux_state = reduxState.connection.thingStates[id];
                if (my_redux_state && my_redux_state.intensity != undefined && my_redux_state.intensity != intensity)
                    total_change.intensity = my_redux_state.intensity;
            }
            if (Object.keys(total_change).length > 0)
                this.setState(total_change);
        }
    }

    changeOutput(intensity: number) {
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
        var { intensity } = this.state;

        var on_press = () => {};
        if (viewType === 'detail')
            on_press = (() => this.changeOutput(1-intensity)).bind(this);

        return (
            <TouchableWithoutFeedback
                onPressIn={on_press}>
              <View style={styles.container}>
                <View style={[styles.fountain_container, {opacity: intensity === 0 ? 0 : 1}]}>
                  <Image style={[layout, styles.fountain]}
                    fadeDuration={0}
                    resizeMode={'contain'}
                    source={this._fountain_img_on}>
                  </Image>
                </View>
                <View style={[styles.fountain_container, {opacity: intensity === 0 ? 1 : 0}]}>
                  <Image style={[layout, styles.fountain]}
                    fadeDuration={0}
                    resizeMode={'contain'}
                    source={this._fountain_img_off}>
                  </Image>
                </View>
              </View>
            </TouchableWithoutFeedback>
        );
    }
}
WaterFountain.contextTypes = {
    store: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  fountain_container: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%'
  },
  fountain: {
      flex: 1,
      width: undefined,
      height: undefined,
  },
});

module.exports = WaterFountain;
