/* @flow */

import * as React from 'react';

import PropTypes from 'prop-types';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { ConfigManager } from '../../js-api-utils/ConfigManager';
import type { ThingStateType, ThingMetadataType } from '../../js-api-utils/ConfigManager';

import Panel from './Panel';

import { TypeFaces } from '../../constants/styles';

const I18n = require('../../js-api-utils/i18n/i18n');

type StateType = {
    intensity: number,
};

type PropsType = {
    id: ?string,
    name: string,
    onSwitch?: number => any,
    intensity?: number,
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

class LightDimmerClass extends React.Component<PropsType, StateType> {
    _unsubscribe: () => any = () => null;

    state = {
        intensity: 0,
    };

    _light_bulb_img_on = require('../../assets/images/icons/lighton.png');
    _light_bulb_img_off = require('../../assets/images/icons//lightoff.png');

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
        const { intensity } = this.state;

        var total_change = {};
        if (lightState.intensity !== intensity)
            total_change.intensity = lightState.intensity;

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
        const { id, name, displayConfig } = this.props;
        const { intensity } = this.state;

        var isActive = intensity > 0;

        return (
            <Panel active={isActive} onPress={() => this.changeIntensity(isActive ? 0 : 100)}>
                <Image style={styles.icon} source={isActive ? this._light_bulb_img_on : this._light_bulb_img_off} />
                <View style={I18n.l2r() ? styles.texts : styles.texts_r2l}>
                    <Text style={[styles.name, isActive ? TypeFaces.bold : {}]}>{I18n.t(name)}</Text>
                    <Text style={[styles.info, isActive ? {color: displayConfig.accentColor} : {}, I18n.r2l() ? {textAlign: 'right'} : {}]}>{intensity + "%"}</Text>
                </View>
            </Panel>
        );
    }
};


const styles = StyleSheet.create({
    icon: {
        width: 40,
        height: 40,
    },
    texts: {
        position: 'absolute',
        left: 10,
        bottom: 10,
    },
    texts_r2l: {
        position: 'absolute',
        right: 10,
        bottom: 10,
    },
    name: {
        color: '#000000',
        fontSize: 17,
        height: 54,
        ...TypeFaces.light,
    },
    info: {
        color: '#000000',
        fontSize: 17,
        ...TypeFaces.light,
    },
});

const LightDimmer = connect(mapStateToProps, mapDispatchToProps) (LightDimmerClass);
export default LightDimmer;
