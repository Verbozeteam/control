/* @flow */

import * as React from 'react';
import PropTypes from 'prop-types';
import { View, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { ConfigManager } from '../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../js-api-utils/ConfigManager';

import { TypeFaces } from '../constants/styles';

const I18n = require('../js-api-utils/i18n/i18n');

type StateType = {
    intensity: number,
};

type PropsType = {
    id: string,
};

function mapStateToProps(state) {
    return {
        displayConfig: state.screen.displayConfig,
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

class WaterFountain extends React.Component<PropsType, StateType> {
    _unsubscribe: () => null = () => null;

    state: StateType = {
        intensity: 0,
    };

    _fountain_img_on = require('../assets/images/basic_ui/fountain_on.png');
    _fountain_img_off = require('../assets/images/basic_ui/fountain_off.png');
    _fountain_img_light_off = require('../assets/images/basic_ui/light_ui/fountain_off.png');

    componentWillMount() {
        this.componentWillReceiveProps(this.props);
    }

    componentWillReceiveProps(newProps: PropsType) {
        this._unsubscribe();
        if (newProps.id) {
            this._unsubscribe = ConfigManager.registerThingStateChangeCallback(newProps.id, this.onFountainChanged.bind(this));
            if (newProps.id && newProps.id in ConfigManager.things)
                this.onFountainChanged(ConfigManager.thingMetas[newProps.id], ConfigManager.things[newProps.id]);
        }
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    onFountainChanged(meta: ThingMetadataType, lightState: ThingStateType) {
        const { intensity } = this.state;

        var total_change = {};
        if (lightState.intensity !== intensity)
            total_change.intensity = lightState.intensity;

        if (Object.keys(total_change).length > 0)
            this.setState(total_change);
    }

    changeOutput(intensity: number) {
        if (this.props.id) {
            ConfigManager.setThingState(this.props.id, {intensity}, true);
        }
    }

    render() {
        var { displayConfig } = this.props;
        var { intensity } = this.state;

        var on_press = on_press = (() => this.changeOutput(1-intensity)).bind(this);

        return (
            <TouchableWithoutFeedback
                    onPressIn={on_press}>
                <View style={styles.container}>
                    <View style={[styles.fountain_container, {opacity: intensity === 0 ? 0 : 1}]}>
                        <Image style={styles.fountain}
                            fadeDuration={0}
                            resizeMode={'contain'}
                            source={this._fountain_img_on}>
                        </Image>
                    </View>
                    <View style={[styles.fountain_container, {opacity: intensity === 0 ? 1 : 0}]}>
                        <Image style={styles.fountain}
                            fadeDuration={0}
                            resizeMode={'contain'}
                            source={displayConfig.lightUI ? this._fountain_img_light_off : this._fountain_img_off}>
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

module.exports = connect(mapStateToProps, mapDispatchToProps) (WaterFountain);
